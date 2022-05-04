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
import { SlurmApi, Configuration } from '../../slurm';
import { pubsub } from '../../pubsub';
import { mergeVariantAnnotations } from './adapters/slurmAdapter';

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
      gene: { position }, // start and end position of a WHOLE gene, not of individual variants
    },
  } = args;

  // fetch CADD and data in parallel
  const caddAnnotationsPromise = fetchCaddAnnotations(position, assemblyId);

  const queries = sources.map(source => buildSourceQuery(source, args));

  const settled = await Promise.allSettled([caddAnnotationsPromise, ...queries]);

  // const settledVariants = await Promise.allSettled([queries]);

  const errors: SourceError[] = [];
  const combinedResults: VariantQueryDataResult[] = [];

  /* inspect variant results and combine if no errors */
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

  const slurm = new SlurmApi(
    new Configuration({
      basePath: process.env.SLURM_ENDPOINT!,
    })
  );

  const headers = {
    'X-SLURM-USER-NAME': process.env.SLURM_USER!,
    'X-SLURM-USER-TOKEN': process.env.SLURM_JWT!,
  };

  // Send dummy hello world
  const slurmJob = await slurm.slurmctldSubmitJob(
    {
      script: '#!/bin/bash\necho Hello World!',
      job: {
        environment: {},
        current_working_directory: `/home/giabaohan`,
        standard_output: 'test.out',
      },
    },
    {
      url: `${process.env.SLURM_ENDPOINT}/slurm/v0.0.37/job/submit`,
      headers,
    }
  );

  let data: VariantQueryDataResult[] = [];

  // once variants are merged, handle annotations
  const caddAannotations = settled.find(
    res => res.status === 'fulfilled' && !isVariantQuery(res.value)
  ) as PromiseFulfilledResult<CADDAnnotationQueryResponse>;

  if (!!caddAannotations && !caddAannotations.value.error) {
    data = annotateCadd(combinedResults, caddAannotations.value.data);
  }

  data = await annotateGnomad(data ?? combinedResults);

  pubsub.subscribe('SLURM_RESPONSE', (...args) => {
    if (args.length > 0) {
      const response = args[0].slurmResponse;
      if (response.jobId === slurmJob.data.job_id) {
        data = mergeVariantAnnotations(combinedResults, response.variants);
      }
    }

    // Mutate results on the backend here
    return { errors, data }
  });

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
