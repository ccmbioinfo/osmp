import annotate from '../../src/resolvers/getVariantsResolver/utils/annotate';
import { VariantQueryResponse } from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  const annotation = [
    {
      alt: 'T',
      ref: 'A',
      chrom: '1',
      pos: 123456,
      assembly: 'gnomAD_GRCh37',
      aaChanges: 'Z[AGC] > Y[TGC]',
      cdna: 'ABC',
      geneName: 'SOME_GENE_NAME',
      gnomadHet: 0,
      gnomadHom: 0,
      transcript: 'ENSTFAKE10000',
    },
  ];

  it('finds the correct coordinates and returns a unique annotation', () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'gnomAD_GRCh37',
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

    const result = annotate(variants, annotation);

    // Check if the corresponding variant has info fields populated
    result.data.forEach(nodeData =>
      nodeData.data.forEach(data => {
        expect(data.variant.info).toEqual({
          aaChanges: 'Z[AGC] > Y[TGC]',
          cDna: 'ABC',
          geneName: 'SOME_GENE_NAME',
          gnomadHet: 0,
          gnomadHom: 0,
          transcript: 'ENSTFAKE10000',
        });
      })
    );
  });

  it('test empty variants data array', async () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };
    const result = annotate(variants, annotation);

    expect(result).toEqual(variants);
  });

  it('test coordinate that does not exist', () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'gnomAD_GRCh37',
                callsets: [],
                end: 999999999999,
                info: {},
                ref: 'A',
                refSeqId: '1',
                start: 999999999999,
              },
              contactInfo: 'DrExample@gmail.com',
            },
          ],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };
    const result = annotate(variants, annotation);

    expect(result).toEqual(variants);
  });
});
