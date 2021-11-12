import logger from '../../logger';
import {
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

const resolveVariantQuery = async (args: QueryInput): Promise<CombinedVariantQueryResponse> => {
  const {
    input: {
      sources,
      variant: { assemblyId },
      // todo: we don't need position in the results anymore
    },
  } = args;

  const queries = sources.map(source => buildSourceQuery(source, args));

  const settled = await Promise.allSettled(queries);

  const errors: SourceError[] = [];
  const combinedResults: VariantQueryDataResult[] = [];

  /* inspect variant results and combine if no errors */
  settled.forEach(response => {
    if (response.status === 'fulfilled' && !response.value.error) {
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

  let annotatedData = combinedResults;

  if (combinedResults.length) {
    const chr = combinedResults[0].variant.referenceName;
    const posiitions = [
      ...new Set(combinedResults.map(r => r.variant.start).sort((a, b) => (a < b ? -1 : 1))),
    ];

    // todo: this is too blunt, the savings from merely narrowing the range are less than 10% for DMD, resulting in 4 large bins
    // when fetching these large bins in parallel, the heap size allocation is exceeded and node crashes
    // so we'll want to use kmeans or other algorithm to find the smallest regions, and if they're bigger than 600kb together, just abort
    // we could also just defer to vep values from gnomad in this case
    // hmm what would be smarter is to get the VEP from gnomad, then pass only the unknowns to the CADD process, though we'll probably have the same problem
    // but this way we can just reject out of hand anything that's bigger than 600kb... yeah that's a good compromise, assuming our mongodb can handle it
    // we'll need to benchmark there, then
    const regions: string[] = [];
    const maxSize = 100;
    let currPos = 0;
    let basePos = 0;
    posiitions.forEach(pos => {
      if (!basePos) {
        basePos = pos;
      }
      if (pos - basePos > maxSize) {
        regions.push(`${chr}:${basePos}-${currPos}`);
        basePos = currPos;
      }
      currPos = pos;
    });

    const caddAnnotations = await fetchCaddAnnotations(regions, assemblyId);

    if (!caddAnnotations.error) {
      annotatedData = annotateCadd(combinedResults, caddAnnotations.data);
    } else {
      errors.push({ error: caddAnnotations.error, source: caddAnnotations.source });
    }

    annotatedData = await annotateGnomad(annotatedData);
  }

  return { errors, data: annotatedData };
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
