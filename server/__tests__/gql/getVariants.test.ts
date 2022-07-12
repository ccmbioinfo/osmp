import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '../../src/typeDefs';
import { testGraphQLQuery } from '../testGraphQLQuery';
import { CombinedVariantQueryResponse } from '../../src/types';

/**
 * Confirm that variant query schema performs and validates as expected
 */
describe('Test minimal getVariants query', () => {
  const GetVariants = `
    query GetVariants($input: QueryInput) {
      getVariants(input: $input) {
        data {
          variant {
            alt
            callsets {
              callsetId
              individualId
              info {
                ad
                dp
                gq
                qual
                zygosity
              }
            }
            end
            info {
              aaChange
              af
              cdna
              consequence
              geneName
              gnomadHet
              gnomadHom
              transcript
            }
            ref
            chromosome
            start
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
            ethnicity
            geographicOrigin
            individualId
            info {
              diagnosis
              candidateGene
              solved
              classifications
            }
            phenotypicFeatures {
              ageOfOnset {
                age
                ageGroup
              }
              dateOfOnset
              levelSeverity
              onsetType
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
    // the bare minimum acceptable response object
    const mockResponse: CombinedVariantQueryResponse = {
      data: [],
      errors: [],
    };

    const mocks = {
      VariantQueryResponse: () => mockResponse,
    };

    const schemaWithMocks = addMocksToSchema({
      schema,
      mocks,
      preserveResolvers: false,
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
