import mongoose, { Document, Model, model, Types, Schema, Query } from 'mongoose';

interface VariantAnnotationId {
  alt: string;
  assembly: number;
  chr: string;
  ref: string;
}

export interface Variant {
  alt: string;
  ref: string;
  chr: string;
  assembly: number;
  aaChanges: string;
  cdna: string;
  geneName: string;
  gnomadHet: number;
  gnomadHom: number;
  transcript: string;
}

interface VariantAnnotationDocument extends Document, Variant {}

const variantAnnotationSchema = new mongoose.Schema({
  alt: {
    type: String,
  },
  ref: {
    type: String,
  },
  chr: {
    type: String,
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
  getAnnotations(id: VariantAnnotationId): Promise<VariantAnnotationId>;
}

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<VariantAnnotationDocument>,
  annotation: VariantAnnotationId
) {
  const variant = await this.find({
    alt: annotation.alt,
    assembly: annotation.assembly,
    chr: annotation.chr,
    ref: annotation.ref,
  });

  console.log(variant);
  return variant;
};

const VariantAnnotation = model<VariantAnnotationDocument, VariantAnnotationModel>(
  'VariantAnnotation',
  variantAnnotationSchema
);
export default VariantAnnotation;
