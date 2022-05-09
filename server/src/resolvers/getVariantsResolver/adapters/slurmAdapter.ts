import {
  SlurmVariantResponse,
  VariantQueryDataResult,
  VariantResponseInfoFields,
} from '../../../types';

export const mergeVariantAnnotations = (
  data: VariantQueryDataResult[],
  variants: SlurmVariantResponse[]
): VariantQueryDataResult[] => {
  const annotationMap: { [x: string]: SlurmVariantResponse } = {};
  variants.forEach(v => {
    const coordinate = `${v.referenceName}:${v.start}-${v.end}-${v.alt}-${v.ref}`;
    if (!(coordinate in annotationMap)) {
      annotationMap[coordinate] = v;
    }
  });

  data.map(d => {
    const coordinate = `${d.variant.referenceName}:${d.variant.start}-${d.variant.end}-${d.variant.alt}-${d.variant.ref}`;

    if (coordinate in annotationMap) {
      const annotation = annotationMap[coordinate];

      const info = d.variant.info as VariantResponseInfoFields;

      info.aaAlt = annotation.nAA;
      info.aaPos = annotation.protPos;
      info.aaRef = annotation.oAA;
      info.af = annotation.af;
      info.gnomadHom = annotation.nhomalt;
      info.cdna = annotation.cDNApos;
      info.transcript = annotation.FeatureID;

      d.variant.info = { ...d.variant.info, ...info };
    }
    return d;
  });

  return data;
};
