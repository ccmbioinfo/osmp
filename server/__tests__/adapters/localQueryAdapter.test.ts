import { transformLocalQueryResponse } from '../../src/resolvers/getVariantsResolver/adapters/localQueryAdapter';

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

    expect(transformed).toEqual([
      {
        individual: {
          individualId: 'testId1',
        },
        variant: {
          alt: 'T',
          assemblyId: 'GRCh37',
          callsets: [],
          end: 1,
          info: {},
          ref: 'A',
          refSeqId: 'Chr2',
          start: 1,
        },
        contactInfo: 'DrExample@gmail.com',
      },
    ]);
  });
});
