import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
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
import validateToken from './patches/validateToken';

const app = express();

const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: 'ssm',
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
    'ssl-required': 'external',
    'confidential-port': 8443,
    'bearer-only': true,
  }
);

// monkeypatch token validator in local and (currently) dev environments
if (process.env.NODE_ENV !== 'production') {
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
  const pubsub = new PubSub();
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res, connection }: any) => ({ req, res, pubsub }),
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

httpServer.listen(5862, () => {
  logger.info('Server running on port 5862');
});
