import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import logger from './logger/index';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import validateToken from './patches/validateToken';
import mongoose from 'mongoose';

// import { WebSocketServer } from 'ws';
// import { useServer } from 'graphql-ws/lib/use/ws';

import { pubsub } from './pubsub';

const app = express();

const memoryStore = new session.MemoryStore();

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING!)
  .then(() => {
    logger.info('successfully connected to mongo!');
  })
  .catch(e => {
    logger.error('Failed connecting to Mongo: ' + e);
    throw e;
  });

app.use(
  session({
    secret: 'ssmp',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = new Keycloak(
  {
    store: memoryStore,
  },
  {
    realm: process.env.KEYCLOAK_REALM!,
    'auth-server-url': process.env.KEYCLOAK_AUTH_URL!,
    resource: process.env.KEYCLOAK_CLIENT_ID!,
    'ssl-required': process.env.NODE_ENV === 'local' ? 'external' : 'all',
    'confidential-port': 443,
    'bearer-only': true,
  }
);

// monkeypatch token validator in local environments where keycloak host is localhost
if (process.env.NODE_ENV === 'local') {
  keycloak.grantManager.validateToken = validateToken;
}

app.use(keycloak.middleware());
app.use(express.json());

app.post('/graphql', (req, res, next) => {
  console.log(req.body.operationName);

  if (req.body.operationName === 'OnSlurmResponse') {
    const { id } = req.body.variables;

    console.log(pubsub);
    pubsub.publish('SLURM_RESPONSE', { slurmResponse: { id } });

    res.send({ data: { slurmResponse: { id } } });
  } else {
    // const grant = (req as any).kauth.grant;
    logger.info(`
  QUERY SUBMITTED:
    ${JSON.stringify({
      // userSub: grant.access_token.content.sub,
      // username: grant.access_token.content.preferred_username,
      // issuer: grant.access_token.content.iss,
      query: req.body.variables,
    })}`);
    next();
  }
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = createServer(app);

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema,

    context: ({ req, res, pubsub }: any) => ({ req, res, pubsub }),

    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await apolloServer.start();

  apolloServer.applyMiddleware({ app });
  // dev only! --> https://www.apollographql.com/docs/apollo-server/data/subscriptions/#operation-context
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onOperation: (message: any, params: any) => {
        console.log(message, params)
        params.schema = schema;
        return params;
      },
    },
    {
      server: httpServer,
      path: apolloServer.graphqlPath,
    }
  );

  ['SIGINT', 'SIGTERM'].forEach(() => {
    // this will interfere with hot-reloading without additional handling
    // process.on(signal, () => subscriptionServer.close());
  });
};

startServer();

httpServer.listen(3000, () => {
  logger.info('Server running on port 3000');
});
