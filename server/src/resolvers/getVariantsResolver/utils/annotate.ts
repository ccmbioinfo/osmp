import { Chromosome, VariantQueryResponse } from '../../../types';
import { VariantAnnotation } from '../../../models/VariantAnnotationModel';

const annotate = (queryResponse: VariantQueryResponse, annotations: VariantAnnotation[]) => {
  const annotationsMap: Record<string, VariantAnnotation> = {};
  annotations.forEach(a => {
    annotationsMap[`${a.alt}-${a.assembly}-${a.chrom}-${a.pos}-${a.ref}`] = a;
  });

  // Loop through queryResponse from different nodes
  for (let i = 0; i < queryResponse.data.length; i++) {
    const nodeData = queryResponse.data[i];

    for (let j = 0; j < nodeData.data.length; j++) {
      const response = nodeData.data[j].variant;

      const key = `${response.alt}-${response.assemblyId}-${
        Chromosome[`Chr${response.refSeqId}` as keyof typeof Chromosome]
      }-${response.start}-${response.ref}`;

      if (key in annotationsMap) {
        const annotation = annotationsMap[key];

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

  return queryResponse;
};

export default annotate;
