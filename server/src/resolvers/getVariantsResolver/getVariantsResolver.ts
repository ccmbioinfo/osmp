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
import getG4rdNodeQuery from './adapters/g4rdAdapter';
import { SlurmApi } from '../../slurm';

const slurm = new SlurmApi();

const getVariants = async (parent: any, args: QueryInput): Promise<CombinedVariantQueryResponse> =>
  await resolveVariantQuery(args);

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

  /* inspect variant results and combine if no errors */
  settled.forEach(response => {
    console.log(response)

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

  // Send dummy hello world
  const submittedJob = await slurm.slurmctldSubmitJob({
    script: "#!/bin/bash echo 'Hello World!'",
  },
  {
    baseURL: `${process.env.SLURM_ENDPOINT}slurm/v0.0.37/job/submit`,
    // headers: { 'Authorization': `Bearer ${process.env.SLURM_JWT!}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    headers: {
      'X-SLURM-USER-NAME': process.env.SLURM_USER!,
      'X-SLURM-USER-TOKEN': process.env.SLURM_JWT!
    }
  })

  console.log('SUBMITTED JOB:', submittedJob);

  // once variants are merged, handle annotations
  const caddAannotations = settled.find(
    res => res.status === 'fulfilled' && !isVariantQuery(res.value)
  ) as PromiseFulfilledResult<CADDAnnotationQueryResponse>;

  let data;

  if (!!caddAannotations && !caddAannotations.value.error) {
    data = annotateCadd(combinedResults, caddAannotations.value.data);
  }

  data = await annotateGnomad(data ?? combinedResults);

  return { errors, data };
};

const buildSourceQuery = (source: string, args: QueryInput): Promise<VariantQueryResponse> => {
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
};

export default getVariants;
