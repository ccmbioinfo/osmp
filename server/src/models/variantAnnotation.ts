import mongoose, { Document, Model, model } from 'mongoose';

export interface VariantAnnotationCoordinates {
  assembly: number;
  alt: string;
  chr: number;
  ref: string;
}

export interface Variant extends VariantAnnotationCoordinates {
  aaChanges: string;
  cdna: string;
  geneName: string;
  gnomadHet: number;
  gnomadHom: number;
  transcript: string;
}

export interface VariantAnnotationDocument extends Document, Variant {}

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
export interface VariantAnnotationModel extends Model<Variant> {
  getAnnotations(id: VariantAnnotationCoordinates): Promise<VariantAnnotationCoordinates>;
}

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<VariantAnnotationDocument>,
  annotation: VariantAnnotationCoordinates
) {
  const variant = await this.find({
    alt: annotation.alt,
    assembly: annotation.assembly,
    chr: annotation.chr,
    ref: annotation.ref,
  });
  return variant;
};

const VariantAnnotation = model<VariantAnnotationDocument, VariantAnnotationModel>(
  'VariantAnnotation',
  variantAnnotationSchema
);

export { variantAnnotationSchema };
export default VariantAnnotation;
