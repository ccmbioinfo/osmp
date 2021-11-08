import { VariantQueryDataResult } from '../../types';
import { GnomadAnnotationId } from '../VariantAnnotationModel';

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
      chrom: variant.referenceName,
      pos: variant.start,
      ref: variant.ref,
    });
  });

  return {
    start: start,
    end: end,
    coordinates: coordinates,
  };
};

export default getCoordinates;