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
    type: String, // The two possible values for assembly is 'GRCh37' and 'GRCh38'. Changing this to an int versus string increases query speed for large dataset.
  },
  an: {
    type: Number,
  },
  af: {
    type: Number,
  },
  filter: {
    type: String,
  },
  gene: {
    type: String,
  },
  transcript: {
    type: String,
  },
  cdna: {
    type: String,
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
