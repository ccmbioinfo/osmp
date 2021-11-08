import logger from '../../logger';
import {
  CADDAnnotationQueryResponse,
  CombinedVariantQueryResponse,
  QueryInput,
  SourceError,
  VariantQueryDataResult,
  VariantQueryResponse,
} from '../../types';
import getLocalQuery from './adapters/localQueryAdapter';
import getRemoteTestNodeQuery from './adapters/remoteTestNodeAdapter';
import fetchCaddAnnotations from './utils/fetchCaddAnnotations';
import annotateCadd from './utils/annotateCadd';
import annotateGnomad from './utils/annotateGnomad';

const getVariants = async (parent: any, args: QueryInput): Promise<CombinedVariantQueryResponse> =>
  await resolveVariantQuery(args);

/**
 *  typeguard: is this a variant query or an annotation query
 */
const isVariantQuery = (
  arg: VariantQueryResponse | CADDAnnotationQueryResponse
): arg is VariantQueryResponse => arg.source !== 'CADD annotations';

const resolveVariantQuery = async (args: QueryInput): Promise<CombinedVariantQueryResponse> => {
  const {
    input: {
      sources,
      variant: { assemblyId },
      gene: { position },
    },
  } = args;

  // fetch CADD and data in parallel
  const caddAnnotationsPromise = fetchCaddAnnotations(position, assemblyId);

  const queries = sources.map(source => buildSourceQuery(source, args));

  const settled = await Promise.allSettled([caddAnnotationsPromise, ...queries]);

  const errors: SourceError[] = [];
  const combinedResults: VariantQueryDataResult[] = [];

  /* for now, this will inspect all promises and pass on errors, including annotation promise, will probably want to change soon */
  settled.forEach(response => {
    if (
      response.status === 'fulfilled' &&
      isVariantQuery(response.value) &&
      !response.value.error
    ) {
      combinedResults.push(...response.value.data);
    } else if (response.status === 'fulfilled' && !!response.value.error) {
      const message =
        process.env.NODE_ENV === 'production' && response.value.error.code === 500
          ? 'Something went wrong!'
          : response.value.error.message;

      errors.push({
        source: response.value.source,
        error: { ...response.value.error!, message },
      });
    } else if (response.status === 'rejected') {
      logger.error('UNHANDLED REJECTION!');
      logger.error(response.reason);
      throw new Error(response.reason);
    }
  });

  const caddAannotations = settled.find(
    res => res.status === 'fulfilled' && !isVariantQuery(res.value)
  ) as PromiseFulfilledResult<CADDAnnotationQueryResponse>;

  // todo: this should be a pipeline each call of which returns [data, errors]
  let annotatedData;

  if (!!caddAannotations && !caddAannotations.value.error) {
    annotatedData = annotateCadd(combinedResults, caddAannotations.value.data);
  }
  if (annotatedData) {
    annotatedData = await annotateGnomad(annotatedData);
  }

  return { errors, data: annotatedData ?? combinedResults };
};

const buildSourceQuery = (source: string, args: QueryInput): Promise<VariantQueryResponse> => {
  switch (source) {
    case 'local':
      return getLocalQuery();
    case 'remote-test':
      return getRemoteTestNodeQuery(args);
    default:
      throw new Error(`source ${source} not found!`);
  }
};

export default getVariants;
