import GnomadAnnotationModel from '../../../models/GnomadAnnotationModel';
import getCoordinates from '../../../models/utils/getCoordinates';
import { GnomadAnnotation, VariantQueryDataResult } from '../../../types';

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

export const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotations: GnomadAnnotation[]
) => {
  const annotationKeyMap = Object.fromEntries(
    annotations.map(a => [`${a.ref}-${a.pos}-${a.chrom}-${a.assembly.replace(/\D/g, '')}`, a])
  );

  queryResponse.forEach(r => {
    const variantKey = `${r.variant.ref}-${r.variant.start}-${
      r.variant.referenceName
    }-${r.variant.assemblyId.replace(/\D/g, '')}`;

    if (variantKey in annotationKeyMap) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { alt, assembly, chrom, ref, pos, type, ...rest } = annotationKeyMap[variantKey];
      r.variant.info = {
        ...r.variant.info,
        ...rest,
      };
    }
  });

  return queryResponse;
};

export default annotateGnomad;
