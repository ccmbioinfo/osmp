import { CaddAnnotation, VariantQueryDataResult } from '../../../types';

const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotationResponse: CaddAnnotation[]
): VariantQueryDataResult[] => {
  const annotationKeys: Record<string, CaddAnnotation> = {};

  annotationResponse.forEach(a => (annotationKeys[`${a.alt}-${a.chrom}-${a.pos}-${a.ref}`] = a));

  queryResponse.forEach(response => {
    const key = `${response.variant.alt}-${response.variant.referenceName.replace(/chr/i, '')}-${
      response.variant.start
    }-${response.variant.ref}`;

    if (key in annotationKeys) {
      response.variant.info = { ...response.variant.info, ...annotationKeys[key] };
    }
  });

  return queryResponse;
};

export default annotate;
