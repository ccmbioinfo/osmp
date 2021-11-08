import { AnnotationQueryResponse, GnomadAnnotation } from '../../../types';
import { GnomadAnnotationId } from '../../../models/GnomadAnnotationModel';
import { GnomadAnnotation as GnomadAnnotationModel } from '../../../models/index';
import { v4 as uuidv4 } from 'uuid';

const formatAnnotations = (result: GnomadAnnotation[]) => {
  return result.map(r => {
    const { chrom, pos, ref, alt, nhomalt, af } = r;
    return {
      chrom: chrom,
      pos: pos,
      alt: alt,
      ref: ref,
      af: af,
      gnomadHet: null,
      gnomadHom: nhomalt,
    };
  });
};

const fetchGnomadAnnotations = (
  coordinates: {
    start: number;
    end: number;
    coordinates: GnomadAnnotationId[];
  },
  assemblyId: string
): Promise<AnnotationQueryResponse> => {
  const source = 'gnomAD annotations';

  return GnomadAnnotationModel.getAnnotations(coordinates, assemblyId)
    .then(result => ({ source, data: formatAnnotations(result) }))
    .catch(error => ({
      error: {
        id: uuidv4(),
        code: 500,
        message: `Error fetching annotations: ${error}`,
      },
      source,
      data: [],
    }));
};

export default fetchGnomadAnnotations;
