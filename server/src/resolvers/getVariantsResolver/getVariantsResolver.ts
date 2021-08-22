import { PubSub } from 'graphql-subscriptions';
import {
  GqlContext,
  QueryInput,
  ResolvedVariantQueryResult,
  VariantQueryDataResult,
  VariantQueryErrorResult,
  VariantQueryResponse,
} from '../../types';
import getEnsemblQuery from './adapters/ensemblQueryAdapter';
import getLocalQuery from './adapters/localQueryAdapter';

const getVariants = async (
  parent: any,
  args: QueryInput,
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
  args: QueryInput,
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
        console.log('QUERY SUCCEEDS', a, c)
        const { data, source } = c;
        a.data.push({ data, source });
      } else {
        console.log('QUERY FAILS', a, c)
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
  args: QueryInput,
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
