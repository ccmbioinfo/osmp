import mongoose, { Document, Model, model } from 'mongoose';
import logger from '../logger';
import { GnomadAnnotation } from '../types';

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

// For model
interface GnomadAnnotationModelMethods extends Model<GnomadAnnotation> {
  getAnnotations(ids: AnnotationInput, assemblyId: string): Promise<GnomadAnnotation[]>;
}

gnomandAnnotationSchema.statics.getAnnotations = async function (
  this: Model<GnomadAnnotationDocument>,
  ids: AnnotationInput,
  assemblyId: string
) {
  const { start, end, coordinates } = ids;

  if (coordinates.length > 0 && assemblyId) {
    const annotation = await this.aggregate([
      { $match: { assembly: assemblyId } },
      { $match: { pos: { $gte: start, $lte: end } } },
      {
        $match: {
          $or: coordinates,
        },
      },
    ]);
    logger.debug(`${annotation.length} gnomad annots found`);
    return annotation;
  } else {
    return [];
  }
};

const GnomadAnnotationModel = model<GnomadAnnotationDocument, GnomadAnnotationModelMethods>(
  'GnomadAnnotation',
  gnomandAnnotationSchema,
  'annotations'
);

export default GnomadAnnotationModel;
