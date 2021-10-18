import express, { Request } from 'express';
import { createServer } from 'http';
import mysql, { RowDataPacket } from 'mysql2/promise';
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

const { STAGER_DB_HOST, STAGER_DB_PORT, STAGER_DB_USER, STAGER_DB_PASSWORD, STAGER_DB } =
  process.env;

app.get(
  '/data',
  async (
    { query: { ensemblId, geneName } }: Request<{ ensemblId: string; geneName: string }>,
    res
  ) => {
    //res.json(createTestQueryResponse(geneName, ensemblId)); // uncomment and comment out 46 to get custom dummy data instead of querying "STAGER-like" databse
    //res.statusCode = 422;
    //res.json('invalid request');
    const result = await getStagerData(geneName as string, ensemblId as string);
    if (!result) {
      res.statusCode = 404;
      return res.json('NOT FOUND');
    } else {
      return res.json(result);
    }
  }
);

const getStagerData = async (geneName: string, ensemblId: string) => {
  const connection = await mysql.createConnection({
    host: STAGER_DB_HOST,
    user: STAGER_DB_USER,
    port: +(STAGER_DB_PORT as string),
    password: STAGER_DB_PASSWORD,
    database: STAGER_DB,
  });

  if (!ensemblId) {
    try {
      const [rows] = await connection.execute<RowDataPacket[][]>(
        'select `ensembl_id` from `gene_alias` where `name` = ? and `kind` = "current_approved_symbol";',
        [geneName]
      );

      if (rows.length) {
        ensemblId = (rows[0] as any).ensembl_id;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      connection.end();
      return false;
    }
  } else if (ensemblId.startsWith('ENS')) {
    // stager stores its ensids as integers
    ensemblId = ensemblId.replace(/ENSG0+/, '');
  }

  let result;

  try {
    const fetchVariantsSql = `
    select * from variant v 
      inner join gene g
        on v.position between g.start and g.end and v.chromosome = g.chromosome
      where g.ensembl_id = ?`;

    console.log('this is ensembl id', ensemblId);
    const [variants] = await connection.execute<RowDataPacket[]>(fetchVariantsSql, [ensemblId]);

    if (!variants.length) {
      connection.end();
      return false;
    }

    const variantIds = variants.map(v => v.variant_id);

    const ensemblIds = variants.map(v => v.ensembl_id);
    const pos = variants.map(v => v.chromosome);

    console.log(variants, variantIds, pos, ensemblIds);
    console.log(variants.map(v => v.gnomad_link));

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

/* create dummy data */
export const createTestQueryResponse = (geneName: string, ensemblId: string) => {
  return Array(50)
    .fill(null)
    .map(() => {
      const individualId = Faker.random.alphaNumeric(10);
      const bases = ['A', 'T', 'C', 'G'];
      const end = Faker.datatype.number({ min: 1000000, max: 2000000 });
      const ref = Faker.helpers.randomize(bases);
      const alt = Faker.helpers.randomize(bases.filter(b => b !== ref));
      return {
        variant: {
          alt,
          assemblyId: 'GRCh37',
          callsets: [
            {
              callSetId: Faker.random.alphaNumeric(10),
              individualId,
              info: {
                ad: Faker.datatype.number({ min: 10000, max: 20000 }),
                dp: Faker.datatype.number({ min: 10000, max: 20000 }),
                gq: Faker.datatype.number({ min: 1, max: 60 }),
                qual: Faker.datatype.number({ min: 1, max: 50 }),
                zygosity: Faker.helpers.randomize(['het', 'het', 'het', 'hom']),
              },
            },
          ],
          end,
          info: {
            aaChanges: `Z[${ref}GC] > Y[${alt}GC]`,
            cDna: 'sampleCDA value',
            geneName: geneName || ensemblId || 'GENENAME',
            gnomadHet: Faker.datatype.float({ min: 0, max: 1, precision: 5 }),
            gnomadHom: Faker.helpers.randomize([0, 0, 0, 0, 0, 1, 2]),
            transcript: `ENSTFAKE${Faker.datatype.number({ min: 10000, max: 20000 })}`,
          },
          ref,
          refSeqId: '19',
          start: end - 1,
        },
        individual: {
          datasetId: Faker.random.alphaNumeric(10),
          diseases: [
            {
              ageOfOnset: {
                age: Faker.helpers.randomize([1, 2, 3, 4, 5]),
                ageGroup: 'some group',
              },
              diseaseId: `ID${Faker.datatype.number(25)}`,
              description: `Description`,
            },
          ],
          ethnicity: ['eth1', 'eth2', 'eth3'][Faker.datatype.number({ min: 0, max: 2 })],
          geographicOrigin: Faker.address.country(),
          individualId,
          info: {
            candidateGene: 'SOME_GENE',
            classifications: 'SOME_CLASSIFICATIONS',
            diagnosis: 'SOME_DIAGNOSIS',
          },
          phenotypicFeatures: [
            {
              ageOfOnset: {
                age: Faker.helpers.randomize([1, 2, 3, 4, 5]),
                ageGroup: 'some group',
              },
              dateOfOnset: Faker.date.past(),
              levelSeverity: Faker.helpers.randomize(['high', 'moderate', 'low']),
              onsetType: 'SOME_ONSETTYPE',
              phenotypeId: 'SOME_PHENOTYPE',
            },
          ],
          sex: Faker.helpers.randomize(['male', 'female']),
        },
        contactInfo: Faker.internet.exampleEmail(),
      };
    });
};

const server = createServer(app);

server.listen(3000, () => {
  console.log(`Test node is running on port 3000!`);
});
