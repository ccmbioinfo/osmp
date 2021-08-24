import { PubSub } from 'graphql-subscriptions';
import logger from '../../logger';
import {
  GqlContext,
  QueryInput,
  ResolvedVariantQueryResult,
  VariantQueryDataResult,
  VariantQueryErrorResult,
  VariantQueryResponse,
} from '../../types';
import getLocalQuery from './adapters/localQueryAdapter';
import getRemoteTestNodeQuery from './adapters/remoteTestNodeAdapter';

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
): arg is ResolvedVariantQueryResult =>
  !Object.values((arg as VariantQueryErrorResult).error || {}).length;

const resolveVariantQuery = async (
  args: QueryInput,
  pubsub: PubSub
): Promise<VariantQueryResponse> => {
  const {
    input: { sources },
  } = args;

  const queries = sources.map(source => buildSourceQuery(source, args, pubsub));
<<<<<<< HEAD
  const resolved = await Promise.all(queries);
=======

  const fulfilled = await Promise.allSettled(queries);
>>>>>>> develop

  const mapped = fulfilled.reduce(
    (a, c) => {
<<<<<<< HEAD
      if (isResolvedVariantQueryResult(c)) {
        console.log('QUERY SUCCEEDS', a, c)
        const { data, source } = c;
        a.data.push({ data, source });
      } else {
        console.log('QUERY FAILS', a, c);
=======
      if (c.status === 'fulfilled' && isResolvedVariantQueryResult(c.value)) {
        const { data, source } = c.value;
        a.data.push({ data, source });
      } else if (c.status === 'fulfilled') {
>>>>>>> develop
        a.errors.push({
          source: c.value.source,
          error: c.value.error!,
        });
<<<<<<< HEAD
        throw c;
=======
      } else if (c.status === 'rejected') {
        logger.error('UNHANDLED REJECTION!');
        logger.error(c.reason);
>>>>>>> develop
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
    case 'remote-test':
      return getRemoteTestNodeQuery(args, pubsub);
    default:
      throw new Error(`source ${source} not found!`);
  }
};

export default getVariants;
