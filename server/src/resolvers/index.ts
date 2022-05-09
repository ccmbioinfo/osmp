import getVariants from './getVariantsResolver';
import { pubsub } from '../pubsub';
import { withFilter } from 'graphql-subscriptions';

const resolvers = {
  Query: {
    getVariants,
  },
  Subscription: {
    slurmResponse: {
      subscribe: () => pubsub.asyncIterator(['SLURM_RESPONSE']),
    },
    // getVariantsSubscription: {
    //   subscribe: () => pubsub.asyncIterator(['VARIANTS_SUBSCRIPTION']),
    // },
    getVariantsSubscription: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('VARIANTS_SUBSCRIPTION'),
        (payload, variables) => {
          // Only push an update if the comment is on
          // the correct repository for this operation
          console.log(payload, variables);
          return true;
        }
      ),
    },
  },
};

export default resolvers;
