import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

interface Options {
  schema: GraphQLSchema;
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
}

export const testGraphQLQuery = async ({ schema, source, variableValues }: Options) => {
  return graphql({
    contextValue: { pubsub: { publish: () => 'fake' } },
    schema,
    source,
    variableValues,
  });
};
