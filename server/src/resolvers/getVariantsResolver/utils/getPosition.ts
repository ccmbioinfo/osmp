import { VariantQueryDataResult } from '../../../types';

const getPosition = (result: VariantQueryDataResult[]) => {
  const variants = result.flat().map(d => d.variant);
  return variants.map(v => `${v.chromosome}:${v.start}-${v.end}`);
};

export default getPosition;
