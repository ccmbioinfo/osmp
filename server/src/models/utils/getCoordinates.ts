import { VariantQueryDataResult } from '../../types';
import { GnomadAnnotationId } from '../GnomadAnnotationModel';

const getCoordinates = (result: VariantQueryDataResult[]) => {
  let start = +Infinity;
  let end = -Infinity;
  const coordinates: GnomadAnnotationId[] = [];
  const variants = result.flat().map(d => d.variant);
  variants.forEach(variant => {
    if (variant.start < start) {
      start = variant.start;
    }

    if (variant.end > end) {
      end = variant.end;
    }

    coordinates.push({
      alt: variant.alt,
      chrom: variant.chromosome,
      pos: variant.start,
      ref: variant.ref,
    });
  });

  return {
    start,
    end,
    coordinates,
  };
};

export default getCoordinates;
