import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { PubSub } from 'graphql-subscriptions';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import logger from './logger/index';

import typeDefs from './typeDefs';
import resolvers from './resolvers';

const app = express();

const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = createServer(app);

const startServer = async () => {
  const pubsub = new PubSub();
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res, connection }: any) => ({ req, res, pubsub }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: true });
  // dev only! --> https://www.apollographql.com/docs/apollo-server/data/subscriptions/#operation-context
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onOperation: (message: any, params: any, websocket: any) => {
        params.schema = schema;
        params.context.pubsub = pubsub;
        return params;
      },
    },
    {
      server: httpServer,
      path: apolloServer.graphqlPath,
    }
  );
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    // this will interfere with hot-reloading without additional handling
    // process.on(signal, () => subscriptionServer.close());
  });
};

startServer();

httpServer.listen({ port: process.env.SERVER_PORT }, () => {
  logger.info(`Our server is punning on port ${process.env.SERVER_PORT}`);
  console.log('hello')
});
