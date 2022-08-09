import { GnomadGRCh37AnnotationModel, GnomadGRCh38AnnotationModels } from '../../../models';
import getCoordinates from '../../../models/utils/getCoordinates';
import resolveAssembly from './resolveAssembly';
import resolveChromosome from './resolveChromosome';
import { GnomadAnnotationQueryResponse, VariantQueryDataResult } from '../../../types';
import { QueryResponseError } from './queryResponseError';
import { timeitAsync } from '../../../utils/timeit';

const fetchGnomadAnnotations = timeitAsync('annotateGnomad')(
  async (
    assemblyId: string,
    position: string,
    queryResponse: VariantQueryDataResult[]
  ): Promise<GnomadAnnotationQueryResponse> => {
    const source = 'gnomAD annotations';

    try {
      const resolvedAssemblyId = resolveAssembly(assemblyId);
      const { chromosome } = resolveChromosome(position);
      const annotationCoordinates = getCoordinates(queryResponse);
      const GnomadAnnotationModel =
        resolvedAssemblyId === 'GRCh37'
          ? GnomadGRCh37AnnotationModel
          : GnomadGRCh38AnnotationModels[chromosome];

      const annotations = await GnomadAnnotationModel.getAnnotations(annotationCoordinates);

      return { source, data: annotations };
    } catch (err) {
      throw new QueryResponseError({
        code: 500,
        message: `Error fetching gnomAD annotations: ${err}`,
        source,
      });
    }
  }
);

export default fetchGnomadAnnotations;
