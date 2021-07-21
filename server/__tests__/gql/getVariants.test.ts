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
    query GetVariants($input: VariantQueryInput) {
      getVariants(input: $input) {
        data {
          data {
            af
            alt
            ref
            chromosome
          }
          source 
        }
        errors {
          source
          error {
            code
            message
          }
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
      variableValues: { input: { start: 1, end: 2, chromosome: '1', sources: ['test'] } },
    });

    if (queryResponse.errors?.length) {
      throw queryResponse.errors;
    }

    const result = queryResponse.data ? queryResponse.data.getVariants : null;

    expect(result).toEqual(mockResponse);
  });
});
