import annotateGnomad from '../../src/resolvers/getVariantsResolver/utils/annotateGnomad';
import {
  GnomadAnnotations,
  GnomadBaseAnnotation,
  GnomadGenomeAnnotation,
  GnomadGRCh37ExomeAnnotation,
  VariantQueryDataResult,
} from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  const annotation: Omit<GnomadBaseAnnotation, 'af'> = {
    alt: 'T',
    chrom: '1',
    nhomalt: 1,
    pos: 123456,
    ref: 'A',
  };
  const primaryAnnotations: GnomadGRCh37ExomeAnnotation[] = [
    {
      ...annotation,
      af: 1,
      an: 1,
    },
  ];
  const secondaryAnnotations: GnomadGenomeAnnotation[] = [
    {
      ...annotation,
      ac: 1,
      af: 2,
    },
  ];
  const annotations: GnomadAnnotations = { primaryAnnotations, secondaryAnnotations };

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

    const result = annotateGnomad(variants, annotations);

    // Check if the corresponding variant has info fields populated
    result.forEach(nodeData =>
      expect(nodeData.variant.info).toEqual({
        af: Math.max(primaryAnnotations[0].af, secondaryAnnotations[0].af),
        an: primaryAnnotations[0].an,
        gnomadHom: primaryAnnotations[0].nhomalt,
        ac: primaryAnnotations[0].af * primaryAnnotations[0].an + secondaryAnnotations[0].ac,
      })
    );
  });

  it('test empty variants data array', async () => {
    const variants: VariantQueryDataResult[] = [];
    const result = annotateGnomad(variants, annotations);

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

    const result = annotateGnomad(variants, annotations);

    expect(result).toEqual(variants);
  });
});
