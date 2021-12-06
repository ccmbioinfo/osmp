import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  G4RDQueryResult,
  transformG4RDQueryResponse,
} from '../../src/resolvers/getVariantsResolver/adapters/g4rdAdapter';
import typeDefs from '../../src/typeDefs';
import { CombinedVariantQueryResponse } from '../../src/types';
import { addMocksToSchema } from '@graphql-tools/mock';
import { testGraphQLQuery } from '../testGraphQLQuery';

/* an around the world test here would validate the transformer and pass it to the schema */

const testResponse: G4RDQueryResult = {
  exists: true,
  numTotalResults: 1,
  results: [
    {
      variant: {
        variantId: 'rs201202918',
        assemblyId: 'GRCh37',
        refseqId: 'NM_001304829.2',
        start: 100573569,
        end: 100573569,
        ref: 'G',
        alt: 'A',
        callsets: [
          {
            callsetId: '12345.sample-singleton-report.csv',
            individualId: '12345',
            info: { ad: 4, dp: 13, qual: 62.8, zygosity: 'heterozygous' },
          },
        ],
        info: {
          geneName: 'SASS6',
          aaChanges: 'NA',
          transcript: 'ENST00000287482',
          gnomadHom: 0,
          cdna: 'c.361-9C>T',
        },
      },
      individual: {
        individualId: '12345',
        diseases: [],
        phenotypicFeatures: [
          { phenotypeId: 'HP:0002140', levelSeverity: null },
          { phenotypeId: 'HP:0002326', levelSeverity: null },
          { phenotypeId: 'HP:0012158', levelSeverity: null },
        ],
        sex: 'NCIT:C46112',
      },
      contactInfo: 'Test User',
    },
  ],
};

const transformed = transformG4RDQueryResponse(testResponse, '1:1234');

/**
 * Confirm that variant query schema performs and validates as expected
 */
describe('Test g4rd query response transformer', () => {
  const GetVariants = `
    query GetVariants($input: QueryInput) {
      getVariants(input: $input) {
        data {
          variant {
            alt
            assemblyId
            callsets {
              callsetId
              individualId
              info {
                ad
                dp
                qual
                zygosity
              }
            }
            end
            info {
              cdna
              geneName
              gnomadHom
              transcript
            }
            ref
            referenceName
            start
            variantId
          }
          individual {
            diseases {
              ageOfOnset {
                age
                ageGroup
              }
              description
              diseaseId
              levelSeverity
              outcome
              stage
            }
            individualId
            phenotypicFeatures {
              levelSeverity
              phenotypeId
            }
            sex
          }
          contactInfo
          source
        }
        errors {
          error {
            id
            code
            message
          }
          source
        }
      }
    }
  `;

  it('issues a valid query', async () => {
    const schema = makeExecutableSchema({ typeDefs });
    const mockResponse: CombinedVariantQueryResponse = {
      data: transformed,
      errors: [],
    };

    const mocks = {
      VariantQueryResponse: () => mockResponse,
    };

    const schemaWithMocks = addMocksToSchema({
      schema,
      mocks,
    });

    const queryResponse = await testGraphQLQuery({
      schema: schemaWithMocks,
      source: GetVariants,
      variableValues: {
        input: {
          variant: { assemblyId: 'foo', maxFrequency: 0.05 },
          gene: { geneName: 'bar' },
          sources: ['test'],
        },
      },
    });

    if (queryResponse.errors?.length) {
      throw queryResponse.errors;
    }

    const result = queryResponse.data ? queryResponse.data.getVariants : null;

    expect(result).toEqual(mockResponse);
  });
});
