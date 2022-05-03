import express, { Request } from 'express';
import { createServer } from 'http';
import mysql, { RowDataPacket } from 'mysql2/promise';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// https://manage.auth0.com/dashboard/us/ssmp-dev/apis/611a9d6bdbe7a6003ec01df4/quickstart
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

const {
  TEST_DATA_DB_HOST,
  TEST_DATA_DB_PORT,
  TEST_DATA_DB_USER,
  TEST_DATA_DB_PASSWORD,
  TEST_DATA_DB,
} = process.env;

app.get('/data', async ({ query: { geneName } }: Request<{ geneName: string }>, res) => {
  if (!geneName) {
    res.statusCode = 422;
    return res.json(`invalid request (geneName: ${geneName})`);
  }

  const result = await getStagerData(geneName as string);

  if (!result) {
    res.statusCode = 404;
    return res.json('There are no variants matching your search criteria.');
  } else {
    return res.json(result);
  }
});

const getStagerData = async (geneName: string) => {
  const connection = await mysql.createConnection({
    host: TEST_DATA_DB_HOST,
    user: TEST_DATA_DB_USER,
    port: +(TEST_DATA_DB_PORT as string),
    password: TEST_DATA_DB_PASSWORD,
    database: TEST_DATA_DB,
  });

  let result;

  try {
    const fetchVariantsSql = `
    select * from variant v where v.gene = ?`;

    const [variants] = await connection.execute<RowDataPacket[]>(fetchVariantsSql, [geneName]);

    if (!variants.length) {
      connection.end();
      return false;
    }

    const variantIds = variants.map(v => v.variant_id);

    const genotypesSql = `select * from genotype g where g.variant_id in (${mysql.escape(
      variantIds
    )})`;

    const [genotypes] = await connection.execute<RowDataPacket[]>(genotypesSql);

    const genotypeDict = genotypes.reduce<Record<string, RowDataPacket[]>>(
      (acc, curr) => ({
        ...acc,
        [curr.variant_id]: acc[curr.variant_id] ? acc[curr.variant_id].concat(curr) : [curr],
      }),
      {}
    );

    result = variants.map(v => ({
      ...v,
      genotypes: genotypeDict[v.variant_id] || [],
    }));
  } catch (e) {
    console.error(e);
    return false;
  } finally {
    connection.end();
  }
  return result;
};

const server = createServer(app);

server.listen(3000, () => {
  console.log('Test node is running on port 3000!');
});
