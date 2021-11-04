import { VariantQueryResponseSchema } from '../../types';
import { VariantAnnotationId } from '../VariantAnnotationModel';

const getCoordinates = (variants: VariantQueryResponseSchema[]) => {
  let start = +Infinity;
  let end = -Infinity;
  const coordinates: VariantAnnotationId[] = [];
  variants
    .map(d => d.variant)
    .forEach(variant => {
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
    start: start - 1,
    end: end + 1,
    coordinates: coordinates,
  };
};

export default getCoordinates;
