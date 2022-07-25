import resolveAssembly from '../../resolvers/getVariantsResolver/utils/resolveAssembly';
import { VariantCoordinate, VariantQueryDataResult } from '../../types';

const getCoordinates = (result: VariantQueryDataResult[]) => {
  let start = +Infinity;
  let end = -Infinity;
  const coordinates: VariantCoordinate[] = [];
  const variants = result.flat().map(d => d.variant);
  variants.forEach(variant => {
    const resolvedAssemblyId = resolveAssembly(variant.assemblyIdCurrent ?? 'GRCh37');

    if (variant.start < start) {
      start = variant.start;
    }

    if (variant.end > end) {
      end = variant.end;
    }

    coordinates.push({
      alt: variant.alt,
      chrom: `${resolvedAssemblyId === 'GRCh38' ? 'chr' : ''}${variant.chromosome}`,
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
