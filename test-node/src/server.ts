import express, { Request } from 'express';
import { createServer } from 'http';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import Faker from 'faker';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

//https://manage.auth0.com/dashboard/us/ssmp-dev/apis/611a9d6bdbe7a6003ec01df4/quickstart
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.TEST_NODE_TOKEN_ISSUER}.well-known/jwks.json`,
  }),
  audience: process.env.TEST_CLIENT_TOKEN_AUDIENCE,
  issuer: process.env.TEST_NODE_TOKEN_ISSUER,
  algorithms: ['RS256'],
});

if (process.env.TEST_NODE_OAUTH_ACTIVE === 'true') {
  app.use(jwtCheck);
}

app.get('/data', async (req: Request<{ ensemblId: string }>, res) => {
  res.json(createTestQueryResponse());
  // res.statusCode = 422;
  // res.json('invalid request'); 
});

export const createTestQueryResponse = () => {
  return Array(50)
    .fill(null)
    .map(() => {
      const individualId = Faker.random.alphaNumeric(10);
      const bases = ['A', 'T', 'C', 'G'];
      const end = Faker.datatype.number({ min: 1000000, max: 2000000 });
      const ref = Faker.helpers.randomize(bases);
      return {
        variant: {
          alt: Faker.helpers.randomize(bases.filter(b => b !== ref)),
          assemblyId: 'GRCh37',
          callsets: [
            {
              callSetId: Faker.random.alphaNumeric(10),
              individualId,
              info: {
                dp: Faker.datatype.number({ min: 10000, max: 20000 }),
                zygosity: Faker.helpers.randomize(['het', 'het', 'het', 'hom']),
              },
            },
          ],
          end,
          info: {
            af: Faker.datatype.float({ min: 0, max: 1, precision: 5 }),
          },
          ref,
          refSeqId: '19',
          start: end - 1,
        },
        individual: {
          individualId,
          contactEmail: Faker.internet.exampleEmail(),
          datasetId: Faker.random.alphaNumeric(10),
          ethnicity: ['eth1', 'eth2', 'eth3'][Faker.datatype.number({ min: 0, max: 2 })],
          sex: ['male', 'female'][Faker.datatype.number({ min: 0, max: 1 })],
          phenotypicFeatures: Faker.lorem
            .words(Faker.datatype.number({ min: 10, max: 20 }))
            .split(' ')
            .map(p => ({ phenotypeId: p })),
        },
      };
    });
};

const server = createServer(app);

server.listen({ port: process.env.SERVER_PORT }, () => {
  console.log(`Test node is running on port ${process.env.SERVER_PORT}!`);
});
