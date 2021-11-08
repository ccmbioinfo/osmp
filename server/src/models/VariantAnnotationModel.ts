import mongoose, { Document, Model, model } from 'mongoose';
import { GnomadAnnotation } from '../types';

export type GnomadAnnotationId = Pick<GnomadAnnotation, 'alt' | 'chrom' | 'ref' | 'pos'>;

interface GnomadAnnotationDocument extends Document, GnomadAnnotation {}

const variantAnnotationSchema = new mongoose.Schema({
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

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<GnomadAnnotationDocument>,
  ids: AnnotationInput,
  assemblyId: string
) {
  // Format from remote node aka stager: position: '19:44905791-44909393', assemblyId: 'GRCh37'

  const { start, end, coordinates } = ids;

  if (coordinates.length > 0 && assemblyId) {
    const annotation = await this.aggregate([
      { $match: { assembly: { $eq: assemblyId } } },
      { $match: { pos: { $gte: start, $lte: end } } },
      {
        $match: {
          $or: coordinates,
        },
      },
    ]);
    return annotation;
  } else {
    return [];
  }
};

const GnomadAnnotationModel = model<GnomadAnnotationDocument, GnomadAnnotationModelMethods>(
  'GnomadAnnotation',
  variantAnnotationSchema
);

export default GnomadAnnotationModel;
