import { VariantAnnotation, VariantQueryResponseSchema } from '../../../types';

const annotate = (
  queryResponse: VariantQueryResponseSchema[],
  annotations: VariantAnnotation[]
): VariantQueryResponseSchema[] => {
  const annotationsMap: Record<string, VariantAnnotation> = {};
  annotations.forEach((a, i) => {
    annotationsMap[`${a.alt}-${a.chrom}-${a.pos}-${a.ref}`] = a;
  });

  queryResponse.forEach((response, i) => {
    const key = `${response.variant.alt}-${response.variant.refSeqId.replace(/chr/i, '')}-${
      response.variant.start
    }-${response.variant.ref}`;

    if (key in annotationsMap) {
      const annotation = annotationsMap[key];

      response.variant.info = annotation;
    }
  });

  return queryResponse;
};

export default annotate;
