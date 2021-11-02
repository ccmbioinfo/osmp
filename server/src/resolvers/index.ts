import getVariants from './getVariantsResolver';

const resolvers = {
  Query: {
    getVariants,
  },
};

export const QUERY_RESOLVED = 'QUERY_RESOLVED';

export default resolvers;
