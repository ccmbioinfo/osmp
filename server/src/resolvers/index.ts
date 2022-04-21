import getVariants from './getVariantsResolver';
import { pubsub } from '../pubsub';
import { withFilter } from 'graphql-subscriptions';

const resolvers = {
  Query: {
    getVariants,
  },
  Subscription: {
    slurmResponse: {
      subscribe: withFilter(() => pubsub.asyncIterator(['SLURM_RESPONSE'])
    , (payload, variables) => {
        console.log('helloooo payload')
        console.log(payload, variables)
        return true;
    }),
  },
}};

export default resolvers;
