import { Chromosome, VariantQueryResponse } from '../../types';
import { VariantAnnotationId } from '../VariantAnnotationModel';

const getCoordinates = (variants: VariantQueryResponse) => {
  let start = +Infinity;
  let end = -Infinity;
  const coordinates: VariantAnnotationId[] = [];
  variants.data
    .map(d => d.data)
    .flat()
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
        assembly: variant.assemblyId,
        chrom: Chromosome[`Chr${variant.refSeqId}` as keyof typeof Chromosome].toString(),
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
