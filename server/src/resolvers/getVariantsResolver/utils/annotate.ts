import { VariantAnnotation as VariantAnnotationModel } from '../../../models';
import { AssemblyId, VariantQueryResponse } from '../../../types';
import { VariantAnnotation, VariantAnnotationId } from '../../../models/VariantAnnotationModel';

enum Chromosome {
  X = 23,
  Y,
}

type ChromosomeString = keyof typeof Chromosome;

const annotate = async (result: VariantQueryResponse) => {
  console.log(result.data[0].data);
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
      chr: findChromosome(variant.refSeqId),
      pos: variant.start,
      ref: variant.ref,
    });
  });

  console.log('hello 2');

  VariantAnnotationModel.getAnnotations(coordinates, startPos - 1, endPos + 1)
    .then(d => console.log(d))
    .catch(err => console.log('error', err));

  const annotations = await VariantAnnotationModel.getAnnotations(
    coordinates,
    startPos - 1,
    endPos + 1
  );

  console.log('hello3');

  const annotationsDict: Record<string, VariantAnnotation> = {};
  const positionsWithAnnotations: Array<number> = [];

  annotations.forEach(a => {
    annotationsDict[`${a.alt}-${a.assembly}-${a.chr}-${a.pos}-${a.ref}`] = a;
    positionsWithAnnotations.push(a.pos);
  });

  // Loop through result from different nodes
  for (let i = 0; i < result.data.length; i++) {
    for (let j = 0; j < result.data[i].data.length; j++) {
      const response = result.data[i].data[j].variant;

      const key = `${response.alt}-${findAssemblyVersion(response.assemblyId)}-${findChromosome(
        response.refSeqId
      )}-${response.start}-${response.ref}`;
      console.log(key);

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

  return {
    result: result,
    annotations: annotations,
  };
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

const findChromosome = (chr: string) => Number(chr) || Chromosome[chr as ChromosomeString];

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
