import { VariantQueryDataResult } from '../../../types';

const getPosition = (result: VariantQueryDataResult[]) => {
  const variants = result.flat().map(d => d.variant);
  const chrom = !!variants.length && variants[0].referenceName;
  let start = +Infinity;
  let end = -Infinity;
  variants.forEach(variant => {
    if (variant.start < start) {
      start = variant.start;
    }

    if (variant.end > end) {
      end = variant.end;
    }
  });
  return `${chrom}:${start}-${end}`;
};

export default getPosition;
