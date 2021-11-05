import annotate from '../../src/resolvers/getVariantsResolver/utils/annotate';
import { VariantAnnotation, VariantQueryDataResult } from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  const annotations: VariantAnnotation[] = [
    {
      alt: 'T',
      ref: 'A',
      chrom: '1',
      pos: 123456,
      aaAlt: 'Z',
      cdna: 'ABC',
      transcript: 'ENSTFAKE10000',
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
          referenceName: '1',
          start: 123456,
        },
        contactInfo: 'DrExample@gmail.com',
      },
    ];

    const result = annotate(variants, annotations);

    console.log(result);

    // Check if the corresponding variant has info fields populated
    result.forEach(nodeData =>
      expect(nodeData.variant.info).toEqual({
        alt: 'T',
        ref: 'A',
        chrom: '1',
        pos: 123456,
        aaAlt: annotations[0].aaAlt,
        cdna: annotations[0].cdna,
        transcript: annotations[0].transcript,
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
          referenceName: '1',
          start: 999999999999,
        },
        contactInfo: 'DrExample@gmail.com',
      },
    ];

    const result = annotate(variants, annotations);

    expect(result).toEqual(variants);
  });
});
