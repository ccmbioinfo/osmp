import annotate from '../../src/resolvers/getVariantsResolver/utils/annotate';
import { VariantQueryResponse } from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  it('finds the correct coordinates and returns a unique annotation', async () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'GRCh37',
                callsets: [],
                end: 123456,
                info: {},
                ref: 'A',
                refSeqId: '1',
                start: 123456,
              },
              contactInfo: 'DrExample@gmail.com',
            },
          ],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };
    const { result, annotations } = await annotate(variants);

    expect(annotations.length).toEqual(1);

    const annotation = annotations[0];

    // Check if annotation has the proper coordinates
    expect(annotation).toHaveProperty('alt', 'T');
    expect(annotation).toHaveProperty('ref', 'A');
    expect(annotation).toHaveProperty('chr', 1);
    expect(annotation).toHaveProperty('pos', 123456);
    expect(annotation).toHaveProperty('assembly', 37);

    // Check if the corresponding variant has info fields populated
    result.data.forEach(d =>
      d.data.forEach(d => {
        expect(d.variant.info).toEqual({
          aaChanges: 'Z[AGC] > Y[TGC]',
          cdna: 'ABC',
          geneName: 'SOME_GENE_NAME',
          gnomadHet: 0,
          gnomadHom: 0,
          transcript: 'ENSTFAKE10000',
        });
      })
    );
  }, 100000);
});
