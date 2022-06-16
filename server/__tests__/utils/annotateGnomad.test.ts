import { annotate } from '../../src/resolvers/getVariantsResolver/utils/annotateGnomad';
import { GnomadAnnotation, VariantQueryDataResult } from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  const annotations: GnomadAnnotation[] = [
    {
      af: 1,
      alt: 'T',
      an: 1,
      assembly: 'gnomAD_GRCh37',
      chrom: '1',
      nhomalt: 1,
      pos: 123456,
      ref: 'A',
      type: 'exome',
    },
  ];

  it('finds the correct coordinates and returns a unique annotation', () => {
    const variants: VariantQueryDataResult[] = [
      {
        source: 'foo',
        individual: { individualId: 'testId1' },
        variant: {
          alt: 'T',
          assemblyId: 'gnomAD_GRCh37',
          callsets: [],
          end: 123456,
          info: {},
          ref: 'A',
          chromosome: '1',
          start: 123456,
        },
        contactInfo: 'DrExample@gmail.com',
      },
    ];

    const result = annotate(variants, annotations);

    // Check if the corresponding variant has info fields populated
    result.forEach(nodeData =>
      expect(nodeData.variant.info).toEqual({
        af: annotations[0].af,
        an: annotations[0].an,
        gnomadHom: annotations[0].nhomalt,
      })
    );
  });

  it('test empty variants data array', async () => {
    const variants: VariantQueryDataResult[] = [];
    const result = annotate(variants, annotations);

    expect(result).toEqual(variants);
  });

  it('test coordinate that does not exist', () => {
    const variants: VariantQueryDataResult[] = [
      {
        source: 'foo',
        individual: { individualId: 'testId1' },
        variant: {
          alt: 'T',
          assemblyId: 'gnomAD_GRCh37',
          callsets: [],
          end: 999999999999,
          info: {},
          ref: 'A',
          chromosome: '1',
          start: 999999999999,
        },
        contactInfo: 'DrExample@gmail.com',
      },
    ];

    const result = annotate(variants, annotations);

    expect(result).toEqual(variants);
  });
});
