import { AnnotationQueryResponse, VariantAnnotation, VariantQueryDataResult } from '../../../types';

const isCADDQuery = (arg: AnnotationQueryResponse): arg is AnnotationQueryResponse =>
  arg.source === 'CADD annotations';

const isGnomadQuery = (arg: AnnotationQueryResponse): arg is AnnotationQueryResponse =>
  arg.source === 'gnomAD annotations';

const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotationResponse: AnnotationQueryResponse[]
): VariantQueryDataResult[] => {
  const gnomad: Record<string, VariantAnnotation> = {};

  const cadd: Record<string, VariantAnnotation> = {};

  annotationResponse.forEach(a => {
    if (isGnomadQuery(a))
      a.data.forEach(d => (gnomad[`${d.alt}-${d.chrom}-${d.pos}-${d.ref}`] = d));
    if (isCADDQuery(a)) a.data.forEach(d => (cadd[`${d.alt}-${d.chrom}-${d.pos}-${d.ref}`] = d));
  });

  queryResponse.forEach(response => {
    const key = `${response.variant.alt}-${response.variant.referenceName.replace(/chr/i, '')}-${
      response.variant.start
    }-${response.variant.ref}`;

    let gnomadAnnotation;
    let caddAnnotation;

    if (key in gnomad) {
      const { af, gnomadHet, gnomadHom } = gnomad[key];
      gnomadAnnotation = { af, gnomadHet, gnomadHom };
    }

    if (key in cadd) {
      console.log('hello found key in cadd');
      console.log(cadd[key]);
      caddAnnotation = cadd[key];
    }

    response.variant.info = { ...caddAnnotation, ...gnomadAnnotation };
  });

  console.log(queryResponse.map(q => q.variant.info));
  return queryResponse;
};

export default annotate;
