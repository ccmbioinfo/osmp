import mongoose, { Document, Model, model } from 'mongoose';
import { VariantQueryResponse } from '../types';
import getCoordinates from './utils/getCoordinates';

export interface VariantAnnotation {
  alt: string;
  ref: string;
  chr: number;
  pos: number;
  assembly: number;
  aaChanges: string;
  cdna: string;
  geneName: string;
  gnomadHet: number;
  gnomadHom: number;
  transcript: string;
}

export type VariantAnnotationId = Pick<
  VariantAnnotation,
  'alt' | 'assembly' | 'chr' | 'ref' | 'pos'
>;

interface VariantAnnotationDocument extends Document, VariantAnnotation {}

const variantAnnotationSchema = new mongoose.Schema({
  alt: {
    type: String,
  },
  ref: {
    type: String,
  },
  chr: {
    type: Number,
  },
  pos: {
    type: Number,
  },
  assembly: {
    type: Number, // The two possible values for assembly is 'GRCh37' and 'GRCh38'. Changing this to an int versus string increases query speed for large dataset.
  },
  aaChanges: {
    type: String,
  },
  cdna: {
    type: String,
  },
  geneName: {
    type: String,
  },
  gnomadHet: {
    type: Number,
  },
  gnomadHom: {
    type: Number,
  },
  transcript: {
    type: String,
  },
});

// For model
interface VariantAnnotationModelMethods extends Model<VariantAnnotation> {
  getAnnotations(variant: VariantQueryResponse): Promise<VariantAnnotation[]>;
}

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<VariantAnnotationDocument>,
  variant: VariantQueryResponse
) {
  const { start, end, coordinates } = getCoordinates(variant);
  if (coordinates.length > 0) {
    const variant = await this.aggregate([
      { $match: { pos: { $gt: start, $lt: end } } },
      {
        $match: {
          $or: coordinates,
        },
      },
    ]);
    return variant;
  } else {
    return [];
  }
};

const VariantAnnotationModel = model<VariantAnnotationDocument, VariantAnnotationModelMethods>(
  'VariantAnnotation',
  variantAnnotationSchema
);

export default VariantAnnotationModel;
