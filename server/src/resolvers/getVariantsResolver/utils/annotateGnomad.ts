import {
  GnomadAnnotations,
  GnomadGenomeAnnotation,
  GnomadGRCh37ExomeAnnotation,
  VariantQueryDataResult,
} from '../../../types';

const _mapToAnnotationsKeyMap = (
  annotations: (GnomadGRCh37ExomeAnnotation | GnomadGenomeAnnotation)[]
) => Object.fromEntries(annotations.map(a => [`${a.ref}-${a.pos}-${a.chrom}`, a]));

const _isGenomeAnnotation = (
  annotation: GnomadGRCh37ExomeAnnotation | GnomadGenomeAnnotation
): annotation is GnomadGenomeAnnotation => annotation && 'ac' in annotation;

export const annotateGnomad = (
  queryResponse: VariantQueryDataResult[],
  annotations: GnomadAnnotations
) => {
  const { primaryAnnotations, secondaryAnnotations } = annotations;
  const primaryAnnotationKeyMap = _mapToAnnotationsKeyMap(primaryAnnotations);
  const secondaryAnnotationKeyMap = _mapToAnnotationsKeyMap(secondaryAnnotations);

  queryResponse.forEach(r => {
    const normalizedChromosome = r.variant.chromosome.replace('chr', '');
    const variantKey = `${r.variant.ref}-${r.variant.start}-${
      r.variant.assemblyIdCurrent === 'GRCh38' ? `chr${normalizedChromosome}` : normalizedChromosome
    }`;

    if (variantKey in primaryAnnotationKeyMap) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        af: primaryAF,
        alt,
        chrom,
        nhomalt,
        pos,
        ref,
        ...rest
      } = primaryAnnotationKeyMap[variantKey];
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // For the GRCh38 assembly, there aren't any secondary gnomAD annotations, so secondaryAF will always be 0
      // and the overall allele frequency will simply be the genome allele frequency
      const secondaryAnnotation = secondaryAnnotationKeyMap?.[variantKey];
      const secondaryAF = secondaryAnnotation?.af ?? 0;

      // GRCh38 only has primary genome; GRCh37 has primary exome and secondary genome
      const is38 = 'ac' in rest;
      const primaryAC = is38 ? rest.ac : Math.round(rest.an * primaryAF);
      const secondaryAC = _isGenomeAnnotation(secondaryAnnotation) ? secondaryAnnotation.ac : 0; // always genome annotation or empty
      r.variant.info = {
        ...r.variant.info,
        // The overall allele frequency is calculated as the greater value between the exome allele frequency and the genome allele frequency
        af: Math.max(primaryAF, secondaryAF),
        gnomadHom: nhomalt,
        ac: primaryAC + secondaryAC,
        // https://www.biostars.org/p/440426/; each homozygote adds 2 to allele count, so remaining are heterozygotes
        // only works for autosomes and X chromosome
        // gnomadHet: ac - 2 * nhomalt,
        ...rest,
      };
    }
  });

  return queryResponse;
};

export default annotateGnomad;
