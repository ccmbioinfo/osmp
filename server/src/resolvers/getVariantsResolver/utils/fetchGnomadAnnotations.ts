import { AnnotationQueryResponse, GnomadAnnotation } from '../../../types';
import { GnomadAnnotation as GnomadAnnotationModel } from '../../../models/index';
import { v4 as uuidv4 } from 'uuid';
import resolveAssembly from './resolveAssembly';

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
  position: string,
  assemblyId: string
): Promise<AnnotationQueryResponse> => {
  const source = 'gnomAD annotations';
  return GnomadAnnotationModel.getAnnotations(position, resolveAssembly(assemblyId))
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
