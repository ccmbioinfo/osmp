import { CaddAnnotation, VariantQueryDataResult } from '../../../types';

const annotate = (
  queryResponse: VariantQueryDataResult[],
  annotationResponse: CaddAnnotation[]
): VariantQueryDataResult[] => {
  const annotationKeys: Record<string, CaddAnnotation> = {};

  /** Choose the variant annotation with the highest consScore to prioritize annotation of the most deleterious transcript. 
  All consequence terms in CADD annotations can be found at https://cadd.gs.washington.edu/static/ReleaseNotes_CADD_v1.3.pdf 
  For reference, the order of severity of the consequences can be found at https://grch37.ensembl.org/info/genome/variation/prediction/predicted_data.html 
  */
  annotationResponse.forEach(a => {
    const annotation = annotationKeys[`${a.alt}-${a.chrom}-${a.pos}-${a.ref}`];

    if (!annotation || a.consScore > annotation.consScore) {
      annotationKeys[`${a.alt}-${a.chrom}-${a.pos}-${a.ref}`] = a;
    }
  });

  queryResponse.forEach(response => {
    const aminoAcidMapping: Record<string, string> = {
      A: 'Ala',
      C: 'Cys',
      D: 'Asp',
      E: 'Glu',
      F: 'Phe',
      G: 'Gly',
      H: 'His',
      I: 'Ile',
      K: 'Lys',
      L: 'Leu',
      M: 'Met',
      N: 'Asn',
      P: 'Pro',
      Q: 'Gln',
      R: 'Arg',
      S: 'Ser',
      T: 'Thr',
      V: 'Val',
      W: 'Trp',
      Y: 'Tyr',
    };

    const key = `${response.variant.alt}-${response.variant.chromosome.replace(/chr/i, '')}-${
      response.variant.start
    }-${response.variant.ref}`;

    if (key in annotationKeys) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { aaAlt, aaPos, aaRef, cdnaPos, chrom, pos, alt, ref, ...rest } = annotationKeys[key];
      response.variant.info = {
        ...response.variant.info,
        aaChange:
          aaAlt &&
          aminoAcidMapping[aaAlt] &&
          aaPos &&
          aaPos !== 'NA' &&
          aaRef &&
          aminoAcidMapping[aaRef]
            ? `p.${aminoAcidMapping[aaRef]}${aaPos}${
                aaAlt === aaRef ? '=' : aminoAcidMapping[aaAlt]
              }`
            : 'NA',
        cdna: alt && cdnaPos && cdnaPos !== 'NA' && ref ? `c.${cdnaPos}${ref}>${alt}` : 'NA',
        ...rest,
      };
    }
  });

  return queryResponse;
};

export default annotate;
