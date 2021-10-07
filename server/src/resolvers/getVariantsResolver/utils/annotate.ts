import { VariantAnnotation as VariantAnnotationModel } from '../../../models';
import { AssemblyId, VariantQueryResponse } from '../../../types';
import { VariantAnnotation, VariantAnnotationId } from '../../../models/VariantAnnotationModel';

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

  const annotations = await VariantAnnotationModel.getAnnotations(
    coordinates,
    startPos - 1,
    endPos + 1
  );

  const annotationsDict: Record<string, VariantAnnotation> = {};
  const positionsWithAnnotations: Array<number> = [];

  annotations.forEach(a => {
    annotationsDict[`${a.alt}-${a.assembly}-${a.chr}-${a.pos}-${a.ref}`] = a;
    positionsWithAnnotations.push(a.pos);
  });

  console.log(annotationsDict);

  // Loop through result from different nodes
  for (let i = 0; i < result.data.length; i++) {
    for (let j = 0; j < result.data[i].data.length; j++) {
      const response = result.data[i].data[j].variant;
      const key = `${response.alt}-${response.assemblyId}-${response.refSeqId}-${response.start}-${response.ref}`;
      if (key in annotationsDict) {
        const annotation = annotationsDict[key];
        response.info = {
          aaChanges: annotation.aaChanges,
          cDna: annotation.cdna,
          geneName: annotation.geneName,
          gnomadHet: annotation.gnomadHet,
          gnomadHom: annotation.gnomadHom,
          transcript: annotation.transcript,
        };
      }
    }
  }

  return result;
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
