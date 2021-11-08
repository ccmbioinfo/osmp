import GnomadAnnotationModel from '../../../models/GnomadAnnotationModel';
import getCoordinates from '../../../models/utils/getCoordinates';
import { VariantQueryDataResult } from '../../../types';

const annotate = async (
  queryResponse: VariantQueryDataResult[]
): Promise<VariantQueryDataResult[]> => {
  const annotationCoordinates = getCoordinates(queryResponse);

  const results = await GnomadAnnotationModel.getAnnotations(
    annotationCoordinates,
    'gnomAD_GRCh37'
  );

  const annotationKeyMap = Object.fromEntries(
    results.map(a => [`${a.ref}-${a.pos}-${a.chrom}-${a.assembly.replace(/\D/g, '')}`, a])
  );

  console.log(annotationKeyMap);

  queryResponse.forEach(r => {
    if (
      `${r.variant.ref}-${r.variant.start}-${
        r.variant.referenceName
      }-${r.variant.assemblyId.replace(/\D/g, '')}` in annotationKeyMap
    ) {
      r.variant.info = {
        ...r.variant.info,
        ...annotationKeyMap[
          `${r.variant.ref}-${r.variant.start}-${
            r.variant.referenceName
          }-${r.variant.assemblyId.replace(/\D/g, '')}`
        ],
      };
    }
  });

  return queryResponse;
};

export default annotate;
