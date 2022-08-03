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
    secret: process.env.SERVER_SESSION_SECRET!,
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
    'ssl-required': process.env.NODE_ENV === 'development' ? 'external' : 'all',
    'confidential-port': 443,
    'bearer-only': true,
  }
);

// monkeypatch token validator in local environments where keycloak host is localhost
if (process.env.NODE_ENV === 'development') {
  keycloak.grantManager.validateToken = validateToken;
}

app.use(keycloak.middleware());
app.use(express.json());

app.post('/graphql', keycloak.protect(), (req, res, next) => {
  const grant = (req as any).kauth.grant;
  logger.info(`
  QUERY SUBMITTED:
    ${JSON.stringify({
      userSub: grant.access_token.content.sub,
      username: grant.access_token.content.preferred_username,
      issuer: grant.access_token.content.iss,
      query: req.body.variables,
    })}`);
  next();
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = createServer(app);

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
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
