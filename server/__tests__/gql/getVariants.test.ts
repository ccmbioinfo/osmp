import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '../../src/typeDefs';
import { testGraphQLQuery } from '../testGraphQLQuery';
import { VariantQueryResponse } from '../../src/types';

/**
 * Confirm that variant query schema performs and validates as expected
 */
describe('Test getVariants query', () => {
  const GetVariants = `
  query GetVariants($input: QueryInput) {
    getVariants(input: $input) {
        data {
            data {
                variant {
                    alt
                    callsets {
                        callSetId
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
                      aaAlt
                      aaPos
                      aaRef
                      assembly
                      cdna
                      chrom
                      consequence
                      geneName
                      gnomadHet
                      gnomadHom
                      pos
                      ref
                      transcript
                    }
                    ref
                    referenceName
                    start
                }
                individual {
                    datasetId
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
            }
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
        meta
    }
}
  `;

  it('issues a valid query', async () => {
    const schema = makeExecutableSchema({ typeDefs });
    // the bare minimum acceptable response object
    const mockResponse: VariantQueryResponse = {
      data: [{ data: [], source: 'test' }],
      errors: [],
      meta: 'test-meta',
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
      variableValues: { input: { variant: {}, gene: {}, sources: ['test'] } },
    });

    if (queryResponse.errors?.length) {
      throw queryResponse.errors;
    }

    const result = queryResponse.data ? queryResponse.data.getVariants : null;

    expect(result).toEqual(mockResponse);
  });
});
