import { PubSub } from 'graphql-subscriptions';
import axios, { AxiosError } from 'axios';
import Faker from 'faker';
import { QUERY_RESOLVED } from '../..';
import { QueryInput, ResolvedVariantQueryResult, ResultTransformer } from '../../../types';

/* This is a test module that fetches some remote data using the ensembl api, \
   which saves some of the trouble of setting up detailed fake data and queries. \
   As the API settles down, we'll probably want to tack on some dummy 'patient data' and other fields

*/

interface EnsemblQueryVariantResponse {
  alternateBases: string[];
  end: number;
  id: string;
  info: {
    EAS_AF: string[];
    AN: string[];
    SAS_AF: string[];
    AF: string[];
    NS: string[];
    DP: string[];
    AMR_AF: string[];
    AC: string[];
    ASP: string[];
    MATCHED_FWD: string[];
    EUR_AF: string[];
    ssID: string[];
    AFR_AF: string[];
  };
  names: string[];
  referenceBases: string[];
  referenceName: string;
  start: string;
  variantSetId: string;
}

interface EnsemblQueryError {
  code: number;
  message: string;
}

interface TempLocusResponse {
  /* eslint-disable camelcase */
  assembly_name: string;
  seq_region_name: string;
  end: number;
  display_name: string;
  start: number;
}

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 * Return some dummy data for testing and design purposes
 */
const getEnsemblQuery = async (
  args: QueryInput,
  pubsub: PubSub
): Promise<ResolvedVariantQueryResult> => {
  let ensembleQueryResponse: { data: { variants: EnsemblQueryVariantResponse[] } } | null = null;
  let ensemblQueryError: EnsemblQueryError | null = null;
  // todo: this needs to hit info endpoint based on gene name or ensembl id
  // http://rest.ensembl.org/lookup/id/ENSG00000130203
  try {
    const locusResponse = await axios.get<TempLocusResponse>(
      `http://rest.ensembl.org/lookup/id/${args.input.gene.ensemblId}`
    );
    ensembleQueryResponse = await axios.post(
      'http://rest.ensembl.org/ga4gh/variants/search',
      transformVariantQueryInputToEnsembl(locusResponse.data)
    );
  } catch (e: unknown) {
    const error = e as AxiosError;
    ensemblQueryError = {
      code: +(error.response?.status || error.code || 500),
      message: error.response?.data.error || error.message,
    };
  }

  // todo: wrap and make type safe
  pubsub.publish(QUERY_RESOLVED, { queryResolved: { node: 'local' } });

  return {
    data: transformEnsemblQueryResponse(ensembleQueryResponse),
    error: ensemblQueryError,
    source: 'ensembl',
  };
};

export const transformEnsemblQueryResponse: ResultTransformer<{
  data: { variants: EnsemblQueryVariantResponse[] };
}> = response => {
  if (!response) {
    return [];
  } else {
    return response.data.variants.map(r => {
      const individualId = Faker.random.alphaNumeric(10);
      return {
        variant: {
          alt: r.alternateBases[0],
          assemblyId: 'GRCh37',
          callsets: [
            {
              callSetId: Faker.random.alphaNumeric(10),
              individualId,
              info: {
                dp: r.info.DP[0] ? +r.info.DP[0] : null,
                zygosity: ['het', 'het', 'het', 'hom'][Faker.datatype.number({ min: 0, max: 3 })],
              },
            },
          ],
          end: +r.end,
          info: {
            af: r.info.AF[0] ? +r.info.AF[0] || null : null,
          },
          ref: r.referenceBases[0],
          refSeqId: r.referenceName,
          start: +r.start,
        },
        individual: {
          individualId,
          datasetId: Faker.random.alphaNumeric(10),
          ethnicity: ['eth1', 'eth2', 'eth3'][Faker.datatype.number({ min: 0, max: 2 })],
          contactEmail: 'random@gmail.com',
          sex: ['male', 'female'][Faker.datatype.number({ min: 0, max: 1 })],
          phenotypicFeatures: Faker.lorem
            .words(Faker.datatype.number({ min: 10, max: 20 }))
            .split(' ')
            .map(p => ({ phenotypeId: p })),
        },
      };
    });
  }
};

/* Return variants from 1000 genomes phase 3 https://www.internationalgenome.org/category/phase-3/
 */
export const transformVariantQueryInputToEnsembl = (args: TempLocusResponse) => ({
  variantSetId: 1,
  datasetId: '6e340c4d1e333c7a676b1710d2e3953c',
  referenceName: args.seq_region_name,
  start: args.start,
  end: args.end,
  pageSize: 20,
});

export default getEnsemblQuery;
