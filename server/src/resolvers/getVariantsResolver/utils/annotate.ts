import { VariantAnnotation } from '../../../models';
import { AssemblyId, VariantQueryResponse } from '../../../types';
import { VariantAnnotationId } from '../../../models/VariantAnnotationModel';

enum Chromosome {
  X = 22,
  Y,
}

type ChromosomeString = keyof typeof Chromosome;

const annotate = async (result: VariantQueryResponse) => {
  const coordinates = [] as VariantAnnotationId[];
  const variants = result.data
    .map(d => d.data)
    .flat()
    .map(d => d.variant);
  const position = variants.map(v => v.start);
  const { startPos, endPos } = findMinMax(position);
  variants.forEach(variant => {
    coordinates.push({
      alt: variant.alt,
      assembly: findAssemblyVersion(variant.assemblyId),
      chr: Number(variant.refSeqId) || Chromosome[variant.refSeqId as ChromosomeString],
      pos: variant.start,
      ref: variant.ref,
    });
  });
  const annotations = await VariantAnnotation.getAnnotations(coordinates, startPos - 1, endPos + 1);
  console.log(annotations);
  // list of annotations -> match with the right variants
};

const findAssemblyVersion = (assembly: AssemblyId) => {
  switch (assembly) {
    case 'GRCh37': {
      return 37;
    }
    case 'GRCh38': {
      return 38;
    }
  }
};

const findMinMax = (arr: Array<number>) => {
  let len = arr.length;
  let min = Infinity;
  let max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return {
    startPos: min,
    endPos: max,
  };
};

export default annotate;
