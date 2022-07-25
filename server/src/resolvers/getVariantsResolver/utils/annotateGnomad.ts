import { GnomadGRCh37AnnotationModel, GnomadGRCh38AnnotationModels } from '../../../models';
import getCoordinates from '../../../models/utils/getCoordinates';
import {
  GnomadAnnotations,
  GnomadGenomeAnnotation,
  GnomadGRCh37ExomeAnnotation,
  VariantQueryDataResult,
} from '../../../types';
import resolveAssembly from './resolveAssembly';
import resolveChromosome from './resolveChromosome';
import { timeitAsync } from '../../../utils/timeit';

const annotateGnomad = timeitAsync('annotateGnomad')(
  async (
    assemblyId: string,
    position: string,
    queryResponse: VariantQueryDataResult[]
  ): Promise<VariantQueryDataResult[]> => {
    const resolvedAssemblyId = resolveAssembly(assemblyId);
    const { chromosome } = resolveChromosome(position);
    const annotationCoordinates = getCoordinates(queryResponse);
    const GnomadAnnotationModel =
      resolvedAssemblyId === 'GRCh37'
        ? GnomadGRCh37AnnotationModel
        : GnomadGRCh38AnnotationModels[chromosome];

    const annotations = await GnomadAnnotationModel.getAnnotations(annotationCoordinates);

    return annotate(queryResponse, annotations);
  }
);

const _mapToAnnotationsKeyMap = (
  annotations: (GnomadGRCh37ExomeAnnotation | GnomadGenomeAnnotation)[]
) => Object.fromEntries(annotations.map(a => [`${a.ref}-${a.pos}-${a.chrom}`, a]));

export const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotations: GnomadAnnotations
) => {
  const { primaryAnnotations, secondaryAnnotations } = annotations;
  const primaryAnnotationKeyMap = _mapToAnnotationsKeyMap(primaryAnnotations);
  const secondaryAnnotationKeyMap = _mapToAnnotationsKeyMap(secondaryAnnotations);

  queryResponse.forEach(r => {
    const variantKey = `${r.variant.ref}-${r.variant.start}-${`${
      r.variant.assemblyIdCurrent === 'GRCh38' ? 'chr' : ''
    }${r.variant.chromosome}`}`;

    if (variantKey in primaryAnnotationKeyMap) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        af: primaryAF,
        alt,
        cdna,
        chrom,
        nhomalt,
        pos,
        ref,
        transcript,
        ...rest
      } = primaryAnnotationKeyMap[variantKey];
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // For the GRCh38 assembly, there aren't any secondary gnomAD annotations, so secondaryAF will always be 0
      // and the overall allele frequency will simply be the genome allele frequency
      const secondaryAF = secondaryAnnotationKeyMap?.[variantKey]?.af ?? 0;

      r.variant.info = {
        ...r.variant.info,
        // The overall allele frequency is calculated as the greater value between the exome allele frequency and the genome allele frequency
        af: Math.max(primaryAF, secondaryAF),
        gnomadHom: nhomalt,
        // Ideally, the cdna value should come from the CADD annotations (if available),
        // but it can also be determined using the values from gnomAD as a fallback
        cdna:
          r.variant.info?.cdna && r.variant.info?.cdna !== 'NA'
            ? r.variant.info?.cdna
            : cdna
            ? `c.${cdna}${ref}>${alt}`
            : 'NA',
        transcript:
          r.variant.info?.transcript && r.variant.info?.transcript !== 'NA'
            ? r.variant.info?.transcript
            : transcript ?? '',
        ...rest,
      };
    }
  });

  return queryResponse;
};

export default annotateGnomad;
