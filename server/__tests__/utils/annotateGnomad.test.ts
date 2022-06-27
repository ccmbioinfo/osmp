import { annotate } from '../../src/resolvers/getVariantsResolver/utils/annotateGnomad';
import resolveAssembly from '../../src/resolvers/getVariantsResolver/utils/resolveAssembly';
import { GnomadAnnotation, VariantQueryDataResult } from '../../src/types';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  const annotation = {
    alt: 'T',
    an: 1,
    cdna: '1234',
    chrom: '1',
    nhomalt: 1,
    pos: 123456,
    ref: 'A',
  };
  const exomeAnnotations: GnomadAnnotation[] = [
    {
      ...annotation,
      af: 0.5,
    },
  ];
  const genomeAnnotations: GnomadAnnotation[] = [
    {
      ...annotation,
      af: 1,
    },
  ];
  const annotations = {
    primaryAnnotations: genomeAnnotations,
    secondaryAnnotations: exomeAnnotations,
  };
  const assemblyId = 'gnomAD_GRCh37';
  const resolvedAssemblyId = resolveAssembly(assemblyId);

  it('finds the correct coordinates and returns a unique annotation', async () => {
    const variants: VariantQueryDataResult[] = [
      {
        source: 'foo',
        individual: { individualId: 'testId1' },
        variant: {
          alt: 'T',
          assemblyId,
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

    const result = await annotate(annotations, resolvedAssemblyId, variants);

    // Check if the corresponding variant has info fields populated
    result.forEach(nodeData =>
      expect(nodeData.variant.info).toEqual({
        af: Math.max(exomeAnnotations[0].af, genomeAnnotations[0].af),
        an: exomeAnnotations[0].an,
        cdna: `c.${exomeAnnotations[0].cdna}${exomeAnnotations[0].ref}>${exomeAnnotations[0].alt}`,
        gnomadHom: exomeAnnotations[0].nhomalt,
      })
    );
  });

  it('test empty variants data array', async () => {
    const variants: VariantQueryDataResult[] = [];
    const result = await annotate(annotations, resolvedAssemblyId, variants);

    expect(result).toEqual(variants);
  });

  it('test coordinate that does not exist', async () => {
    const variants: VariantQueryDataResult[] = [
      {
        source: 'foo',
        individual: { individualId: 'testId1' },
        variant: {
          alt: 'T',
          assemblyId,
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

    const result = await annotate(annotations, resolvedAssemblyId, variants);

    expect(result).toEqual(variants);
  });
});
