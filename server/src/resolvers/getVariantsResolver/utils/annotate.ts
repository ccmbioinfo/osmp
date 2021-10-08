import { VariantAnnotation as VariantAnnotationModel } from '../../../models';
import { VariantQueryResponse } from '../../../types';
import { VariantAnnotation, VariantAnnotationId } from '../../../models/VariantAnnotationModel';

enum Chromosome {
  X = 23,
  Y,
}

enum Assembly {
  GRCh37 = 37,
  hg19 = 37,
  GRCh38 = 38,
  hg38 = 38,
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
      assembly: Assembly[variant.assemblyId],
      chr: findChromosome(variant.refSeqId),
      pos: variant.start,
      ref: variant.ref,
    });
  });

  let annotations: VariantAnnotation[];
  try {
    annotations = await VariantAnnotationModel.getAnnotations(
      coordinates,
      startPos - 1,
      endPos + 1
    );
  } catch (err) {
    console.log(err);
    annotations = [];
  }

  const annotationsDict: Record<string, VariantAnnotation> = {};

  annotations.forEach(a => {
    annotationsDict[`${a.alt}-${a.assembly}-${a.chr}-${a.pos}-${a.ref}`] = a;
  });

  // Loop through result from different nodes
  for (let i = 0; i < result.data.length; i++) {
    for (let j = 0; j < result.data[i].data.length; j++) {
      const response = result.data[i].data[j].variant;

      const key = `${response.alt}-${Assembly[response.assemblyId]}-${findChromosome(
        response.refSeqId
      )}-${response.start}-${response.ref}`;

      if (key in annotationsDict) {
        const annotation = annotationsDict[key];
        const { aaChanges, cdna, geneName, gnomadHet, gnomadHom, transcript } = annotation;

        response.info = {
          aaChanges: aaChanges,
          cDna: cdna,
          geneName: geneName,
          gnomadHet: gnomadHet,
          gnomadHom: gnomadHom,
          transcript: transcript,
        };
      }
    }
  }

  return {
    result: result,
    annotations: annotations,
  };
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
