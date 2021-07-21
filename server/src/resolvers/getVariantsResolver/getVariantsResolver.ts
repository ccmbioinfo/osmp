import { PubSub } from 'graphql-subscriptions';
import {
  GqlContext,
  ResolvedVariantQueryResult,
  VariantQueryDataResult,
  VariantQueryErrorResult,
  VariantQueryInput,
  VariantQueryResponse,
} from '../../types';
import getEnsemblQuery from './adapters/ensemblQueryAdapter';
import getLocalQuery from './adapters/localQueryAdapter';

const getVariants = async (
  parent: any,
  args: VariantQueryInput,
  { pubsub }: GqlContext,
  info: any
): Promise<VariantQueryResponse> => {
  const result = await resolveVariantQuery(args, pubsub);
  return result;
};

/**
 *  typeguard
 */
const isResolvedVariantQueryResult = (
  arg: ResolvedVariantQueryResult | VariantQueryErrorResult
): arg is ResolvedVariantQueryResult => !!(arg as ResolvedVariantQueryResult).data.length;

const resolveVariantQuery = async (
  args: VariantQueryInput,
  pubsub: PubSub
): Promise<VariantQueryResponse> => {
  const {
    input: { sources },
  } = args;

  const queries = sources.map(source => buildSourceQuery(source, args, pubsub));

  const resolved = await Promise.all(queries);

  const mapped = resolved.reduce(
    (a, c) => {
      if (isResolvedVariantQueryResult(c)) {
        const { data, source } = c;
        a.data.push({ data, source });
      } else {
        a.errors.push({
          source: (c as VariantQueryErrorResult).source,
          error: (c as VariantQueryErrorResult).error,
        });
      }
      return a;
    },
    {
      errors: [] as VariantQueryErrorResult[],
      data: [] as VariantQueryDataResult[],
    }
  );

  return {
    ...mapped,
    meta: 'some test meta',
  };
};

const buildSourceQuery = (
  source: string,
  args: VariantQueryInput,
  pubsub: PubSub
): Promise<ResolvedVariantQueryResult> => {
  switch (source) {
    case 'local':
      return getLocalQuery(args, pubsub);
    case 'ensembl':
      return getEnsemblQuery(args, pubsub);
    default:
      throw new Error(`source ${source} not found!`);
  }
};

export default getVariants;
