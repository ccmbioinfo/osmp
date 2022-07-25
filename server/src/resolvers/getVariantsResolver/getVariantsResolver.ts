import logger from '../../logger';
import {
  CADDAnnotationQueryResponse,
  CombinedVariantQueryResponse,
  ErrorResponse,
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
import liftover from './utils/liftOver';
import getG4rdNodeQuery from './adapters/g4rdAdapter';
import { timeitAsync } from '../../utils/timeit';

const getVariants = async (parent: any, args: QueryInput): Promise<CombinedVariantQueryResponse> =>
  await resolveVariantQuery(args);

const isVariantQuery = (
  arg: VariantQueryResponse | CADDAnnotationQueryResponse
): arg is VariantQueryResponse => arg.source !== 'CADD annotations';

const resolveVariantQuery = timeitAsync('resolveVariantQuery')(
  async (args: QueryInput): Promise<CombinedVariantQueryResponse> => {
    const {
      input: {
        sources,
        variant: { assemblyId },
        gene: { position },
      },
    } = args;

    let annotationPosition = position;

    // fetch data
    const queries = sources.map(source => buildSourceQuery(source, args));
    const settledQueries = await Promise.allSettled([...queries]);

    const errors: SourceError[] = [];
    const combinedResults: VariantQueryDataResult[] = [];

    /* inspect variant results and combine if no errors */
    settledQueries.forEach(response => {
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

    logger.debug(`${combinedResults.length} partipants found from queries`);

    // filter data that are not in user requested assemblyId
    const dataForLiftover = combinedResults.filter(v => v.variant.assemblyId !== assemblyId);
    // filter data that are already in user requested assemlbyId
    let dataForAnnotation = combinedResults.filter(v => {
      if (v.variant.assemblyId === assemblyId) {
        v.variant.assemblyIdCurrent = assemblyId;
        return true;
      } else return false;
    });
    let unliftedVariants: VariantQueryDataResult[] = [];

    // perform liftOver if needed
    if (dataForLiftover.length) {
      const liftoverResults = await liftover(dataForAnnotation, dataForLiftover, assemblyId);
      ({ unliftedVariants, dataForAnnotation, annotationPosition } = liftoverResults);
    }

    // Cadd annotations for data in user requested assemblyId
    let data: VariantQueryDataResult[] = dataForAnnotation;
    const caddAnnotationsPromise = fetchCaddAnnotations(annotationPosition, assemblyId);
    const settledCadd = (await Promise.allSettled([caddAnnotationsPromise]))[0]; // wait for single promise to settle

    if (
      settledCadd.status === 'fulfilled' &&
      !isVariantQuery(settledCadd.value) &&
      !settledCadd.value.error
    ) {
      data = annotateCadd(dataForAnnotation, settledCadd.value.data);
    } else if (settledCadd.status === 'fulfilled') {
      errors.push({
        source: settledCadd.value.source,
        error: settledCadd.value.error as ErrorResponse,
      });
    }

    data = await annotateGnomad(assemblyId, annotationPosition, data ?? dataForAnnotation);

    // return unmapped variants if there's any
    if (unliftedVariants.length) {
      data = data.concat(unliftedVariants);
    }
    return { errors, data };
  }
);

const buildSourceQuery = timeitAsync('buildSourceQuery')(
  (source: string, args: QueryInput): Promise<VariantQueryResponse> => {
    switch (source) {
      case 'local':
        return getLocalQuery();
      case 'remote-test':
        return getRemoteTestNodeQuery(args);
      case 'g4rd':
        return getG4rdNodeQuery(args);
      default:
        throw new Error(`source ${source} not found!`);
    }
  }
);

export default getVariants;
