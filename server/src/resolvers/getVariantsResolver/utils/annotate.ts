import { VariantAnnotation, VariantQueryResponseSchema } from '../../../types';

const annotate = (
  queryResponse: VariantQueryResponseSchema[],
  annotations: VariantAnnotation[]
): VariantQueryResponseSchema[] => {
  const annotationsMap: Record<string, VariantAnnotation> = {};

  annotations.forEach(a => {
    annotationsMap[`${a.alt}-${a.chrom}-${a.pos}-${a.ref}`] = a;
  });

  let count = 0;
  queryResponse.forEach(response => {
    const key = `${response.variant.alt}-${response.variant.referenceName.replace(/chr/i, '')}-${
      response.variant.start
    }-${response.variant.ref}`;

    console.log(key)

    if (key in annotationsMap) {
      count = count + 1;
      const annotation = annotationsMap[key];

      response.variant.info = annotation;
    }
  });

  console.log(annotationsMap)
  console.log('% variants annotated', count, (count / queryResponse.length) * 100);
  return queryResponse;
};

export default annotate;
