import GnomadAnnotationModel from '../../../models/GnomadAnnotationModel';
import getCoordinates from '../../../models/utils/getCoordinates';
import { GnomadAnnotation, GnomadAnnotations, VariantQueryDataResult } from '../../../types';

const annotateGnomad = async (
  queryResponse: VariantQueryDataResult[]
): Promise<VariantQueryDataResult[]> => {
  const annotationCoordinates = getCoordinates(queryResponse);

  const annotations = await GnomadAnnotationModel.getAnnotations(
    annotationCoordinates,
    'gnomAD_GRCh37'
  );

  return annotate(queryResponse, annotations);
};

const _mapToAnnotationsKeyMap = (annotations: GnomadAnnotation[]) =>
  Object.fromEntries(
    annotations.map(a => [`${a.ref}-${a.pos}-${a.chrom}-${a.assembly.replace(/\D/g, '')}`, a])
  );

export const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotations: GnomadAnnotations
) => {
  const { exomeAnnotations, genomeAnnotations } = annotations;
  const exomeAnnotationKeyMap = _mapToAnnotationsKeyMap(exomeAnnotations);
  const genomeAnnotationKeyMap = _mapToAnnotationsKeyMap(genomeAnnotations);

  queryResponse.forEach(r => {
    const variantKey = `${r.variant.ref}-${r.variant.start}-${
      r.variant.chromosome
    }-${r.variant.assemblyId.replace(/\D/g, '')}`;

    if (variantKey in exomeAnnotationKeyMap) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const {
        af: exomeAF,
        alt,
        assembly,
        cdna,
        chrom,
        ref,
        pos,
        type,
        nhomalt,
        ...rest
      } = exomeAnnotationKeyMap[variantKey];
      const genomeAF = genomeAnnotationKeyMap?.[variantKey]?.af ?? 0;

      r.variant.info = {
        ...r.variant.info,
        // The gnomAD allele frequency is calculated as the highest value between the gnomAD exome allele frequency and the gnomAD genome allele frequency
        af: Math.max(exomeAF, genomeAF),
        gnomadHom: nhomalt,
        cdna:
          r.variant.info?.cdna && r.variant.info?.cdna !== 'NA'
            ? r.variant.info?.cdna
            : cdna
            ? `c.${cdna}${ref}>${alt}`
            : 'NA',
        ...rest,
      };
    }
  });

  return queryResponse;
};

export default annotateGnomad;
