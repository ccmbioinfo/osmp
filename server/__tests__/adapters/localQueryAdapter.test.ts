import {
  transformLocalErrorResponse,
  transformLocalQueryResponse,
} from '../../src/resolvers/getVariantsResolver/adapters/localQueryAdapter';

/**
 * Confirm that our adapter is transforming the query and results as we would expect
 * This test is meant as a model for later integrations and can be deleted eventually
 */
describe('Test local query adapter', () => {
  it('trasforms the query', async () => {
    // not implemented currently b/c test data is static
    return true;
  });

  it('trasforms the results', async () => {
    const transformed = transformLocalQueryResponse([
      { reference: 'A', alternative: 'T', chromosome: 'X', extraneous: 'foo' },
    ]);

    expect(transformed).toEqual([{ ref: 'A', alt: 'T', chromosome: 'X' }]);
  });

  it('trasforms the errors', async () => {
    const transformed = transformLocalErrorResponse({ errors: ['error1', 'error2'], code: 500 });

    expect(transformed).toEqual({ code: 500, message: 'error1\nerror2' });
  });
});
