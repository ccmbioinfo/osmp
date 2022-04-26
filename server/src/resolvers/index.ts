import getVariants from './getVariantsResolver';
import { pubsub } from '../pubsub';

const resolvers = {
  Query: {
    getVariants,
  },
  Subscription: {
    slurmResponse: {
      subscribe: () => pubsub.asyncIterator(['SLURM_RESPONSE']),
    },
  },
};

export default resolvers;
