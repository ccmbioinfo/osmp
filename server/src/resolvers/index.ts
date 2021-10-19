import getVariants from './getVariantsResolver';
import { GqlContext } from '../types';

const resolvers = {
  Query: {
    getVariants,
  },
  Subscription: {
    queryResolved: {
      subscribe: (parent: any, args: null, ctx: GqlContext) =>
        ctx.pubsub.asyncIterator([QUERY_RESOLVED]),
    },
  },
};

export const QUERY_RESOLVED = 'QUERY_RESOLVED';

export default resolvers;
