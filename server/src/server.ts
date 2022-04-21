import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
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
  console.log(req.body);

  if (req.body.kind === "subscription") {
    const { id } = req.body;

    console.log(pubsub)
    pubsub.publish("SLURM_RESPONSE", { slurmResponse: { id } });
  }

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
});

app.post('/test', (req, res, next) => {
  console.log(req.body); // req would contain data
  // send results as a stream

  const { id } = req.body;

  console.log(pubsub)
  pubsub.publish("SLURM_RESPONSE", { slurmResponse: { id } });

  next();
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = createServer(app);

// Set up WebSocket server.
// const wsServer = new WebSocketServer({
//   server: httpServer,
//   path: '/graphql',
// });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// useServer({ schema,
//   // As before, ctx is the graphql-ws Context where connectionParams live.
//   onConnect: async (ctx) => {
//     console.log('Connected!')
//     console.log(ctx)
//   },
//   onDisconnect(ctx, code, reason) {
//     console.log(ctx, code, reason)
//     console.log('Disconnected!');
//   },
//   context: ({ req, res, pubsub }: any) => ({ req, res, pubsub })

// }, wsServer);

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema,
    
    context: ({ req, res, pubsub }: any) => ({ req, res, pubsub }),
    
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
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
