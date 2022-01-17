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
    const expectedResponse = Array(1)
      .fill(null)
      .map(() => ({
        source: 'local',
        individual: {
          individualId: `someTestId`,
          phenotypicFeatures: Array(5)
            .fill(null)
            .map(() => ({
              ageOfOnset: {
                age: 10,
                ageGroup: 'some group',
              },
              dateOfOnset: '2021-10-10',
              levelSeverity: 'high',
              onsetType: '3',
              phenotypeId: '4',
            })),
        },
        variant: {
          alt: 'T',
          assemblyId: 'GRCh37',
          callsets: [],
          end: 50162978,
          info: {},
          ref: 'A',
          referenceName: '1',
          start: 50162978,
        },
        contactInfo: 'DrExample@gmail.com',
      }));

    expectedResponse.forEach((e, i) => {
      expect(transformed[i]).toEqual(e);
    });
  });
});
