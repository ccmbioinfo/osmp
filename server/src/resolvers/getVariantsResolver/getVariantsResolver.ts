/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from '../../logger';
import {
  AnnotationQueryResponse,
  CombinedVariantQueryResponse,
  QueryInput,
  SourceError,
  VariantQueryDataResult,
  VariantQueryResponse,
} from '../../types';
import getLocalQuery from './adapters/localQueryAdapter';
import getRemoteTestNodeQuery from './adapters/remoteTestNodeAdapter';
import fetchAnnotations from './utils/fetchAnnotations';
import fetchGnomadAnnotations from './utils/fetchGnomadAnnotations';
import annotate from './utils/annotate';
import getPosition from './utils/getPosition';
import getCoordinates from '../../models/utils/getCoordinates';
import { getKMeansCluster, getClusterPosition } from './utils/kMeans';

const getVariants = async (parent: any, args: QueryInput): Promise<CombinedVariantQueryResponse> =>
  await resolveVariantQuery(args);

const resolveVariantQuery = async (args: QueryInput): Promise<CombinedVariantQueryResponse> => {
  const {
    input: {
      sources,
      variant: { assemblyId },
    },
  } = args;

  /**
   *  typeguard: is this a variant query or CADD/ gnomAD annotation query
   */
  const isVariantQuery = (
    arg: VariantQueryResponse | AnnotationQueryResponse
  ): arg is VariantQueryResponse => arg.source !== 'annotations';

  const queries = sources.map(source => buildSourceQuery(source, args));

  const settledVariants = await Promise.allSettled(queries);

  const errors: SourceError[] = [];
  const combinedResults: VariantQueryDataResult[] = [];

  settledVariants.forEach(response => {
    if (
      response.status === 'fulfilled' &&
      !response.value.error &&
      isVariantQuery(response.value)
    ) {
      combinedResults.push(...response.value.data);
    }
  });

  const position = getPosition(combinedResults);
  const gnomadCoordinates = getCoordinates(combinedResults);

  // To-do: We can modify the number of clusters based on the sie of the gene - max ~10 otherwise we have "429: Too many requests error"
  const numberOfClusters =
    Math.sqrt(position.length / 2) > 10 ? Math.sqrt(position.length / 2) : 10;
  const cluster = getKMeansCluster(position, numberOfClusters);
  const clusteredPosition = getClusterPosition(cluster);

  const annotationsPromise = clusteredPosition.map(p => buildCADDAnnotationQuery(p, assemblyId));

  const gnomadAnnotationsPromise = fetchGnomadAnnotations(gnomadCoordinates, 'gnomAD_GRCh37');

  const settledAnnotations = await Promise.allSettled([
    gnomadAnnotationsPromise,
    ...annotationsPromise,
  ]);

  // Add errors
  [...settledAnnotations, ...settledVariants].forEach(response => {
    if (response.status === 'fulfilled' && !!response.value.error) {
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

  const annotations = (
    settledAnnotations.filter(
      res => res.status === 'fulfilled'
    ) as PromiseFulfilledResult<AnnotationQueryResponse>[]
  ).map(a => a.value);

  let annotatedData;

  if (annotations.find(a => !a.error)) {
    annotatedData = annotate(combinedResults, annotations);
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

const buildCADDAnnotationQuery = (
  position: string,
  assembly: string
): Promise<AnnotationQueryResponse> => {
  return fetchAnnotations(position, assembly);
};

export default getVariants;
