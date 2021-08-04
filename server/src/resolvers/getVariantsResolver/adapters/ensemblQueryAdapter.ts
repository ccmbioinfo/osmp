import { PubSub } from 'graphql-subscriptions';
import axios, { AxiosError } from 'axios';
import Faker from 'faker';
import { QUERY_RESOLVED } from '../..';
import { ResolvedVariantQueryResult, ResultTransformer, VariantQueryInput } from '../../../types';

/* This is a test modules that fetches some remote data using the ensembl api, \
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

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 * Return some dummy data for testing and design purposes
 */
const getEnsemblQuery = async (
  args: VariantQueryInput,
  pubsub: PubSub
): Promise<ResolvedVariantQueryResult> => {
  let ensembleQueryResponse: { data: { variants: EnsemblQueryVariantResponse[] } } | null = null;
  let ensemblQueryError: EnsemblQueryError | null = null;
  try {
    ensembleQueryResponse = await axios.post(
      'http://rest.ensembl.org/ga4gh/variants/search',
      transformVariantQueryInputToEnsembl(args)
    );
  } catch (e: unknown) {
    console.log(e);
    const error = e as AxiosError<EnsemblQueryError>;
    ensemblQueryError = { code: +(error.code || 500), message: error.message };
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
    return response.data.variants.map(r => ({
      af: r.info.AF[0] ? +r.info.AF[0] || null : null,
      alt: r.alternateBases[0],
      chromosome: r.referenceName,
      datasetId: Faker.random.alphaNumeric(25),
      end: +r.end,
      ethnicity: ['eth1', 'eth2', 'eth3'][Faker.datatype.number({ min: 0, max: 2 })],
      dp: r.info.DP[0] ? +r.info.DP[0] : null,
      phenotypes: Faker.lorem.words(Faker.datatype.number({ min: 10, max: 20 })),
      ref: r.referenceBases[0],
      rsId: r.names[0],
      someFakeScore: Faker.datatype.float(),
      sex: ['male', 'female'][Faker.datatype.number({ min: 0, max: 1 })],
      start: +r.start,
      zygosity: ['het', 'het', 'het', 'hom'][Faker.datatype.number({ min: 0, max: 3 })],
    }));
  }
};

/* Return variants from 1000 genomes phase 3 https://www.internationalgenome.org/category/phase-3/
 */
export const transformVariantQueryInputToEnsembl = (args: VariantQueryInput) => ({
  variantSetId: 1,
  datasetId: '6e340c4d1e333c7a676b1710d2e3953c',
  referenceName: args.input.chromosome,
  start: args.input.start,
  end: args.input.end,
  pageSize: 100,
});

export default getEnsemblQuery;
