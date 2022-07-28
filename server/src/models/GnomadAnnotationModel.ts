import mongoose, { Document, Model, model } from 'mongoose';
import logger from '../logger';
import { GnomadAnnotation, GnomadAnnotations } from '../types';

export type GnomadAnnotationId = Pick<GnomadAnnotation, 'alt' | 'chrom' | 'ref' | 'pos'>;

interface GnomadAnnotationDocument extends Document, GnomadAnnotation {}

const gnomandAnnotationSchema = new mongoose.Schema({
  chrom: {
    type: String,
  },
  pos: {
    type: Number,
  },
  ref: {
    type: String,
  },
  alt: {
    type: String,
  },
  nhomalt: {
    type: String,
  },
  an: {
    type: Number,
  },
  af: {
    type: Number,
  },
  assembly: {
    type: String,
  },
  type: {
    type: String,
  },
});

type AnnotationInput = {
  start: number;
  end: number;
  coordinates: GnomadAnnotationId[];
};

type AnnotationType = 'exome' | 'genome';

// For model
interface GnomadAnnotationModelMethods extends Model<GnomadAnnotation> {
  getAnnotations(ids: AnnotationInput, assemblyId: string): Promise<GnomadAnnotations>;
}

gnomandAnnotationSchema.statics.getAnnotations = async function (
  this: Model<GnomadAnnotationDocument>,
  ids: AnnotationInput,
  assemblyId: string
) {
  const { start, end, coordinates } = ids;
  const getAnnotationsByType = async (type: AnnotationType) =>
    await this.aggregate([
      { $match: { type } },
      { $match: { assembly: assemblyId } },
      { $match: { pos: { $gte: start, $lte: end } } },
      {
        $match: {
          $or: coordinates,
        },
      },
    ]);
  const annotations = {
    exomeAnnotations: [] as GnomadAnnotation[],
    genomeAnnotations: [] as GnomadAnnotation[],
  };

  if (coordinates.length > 0 && assemblyId) {
    annotations.exomeAnnotations = await getAnnotationsByType('exome');
    annotations.genomeAnnotations = await getAnnotationsByType('genome');

    logger.debug(`${annotations.exomeAnnotations.length} exome gnomAD annotation(s) found`);
    logger.debug(`${annotations.genomeAnnotations.length} genome gnomAD annotation(s) found`);
  }

  return annotations;
};

const GnomadAnnotationModel = model<GnomadAnnotationDocument, GnomadAnnotationModelMethods>(
  'GnomadAnnotation',
  gnomandAnnotationSchema,
  'annotations'
);

export default GnomadAnnotationModel;
