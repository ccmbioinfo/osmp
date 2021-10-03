import mongoose from 'mongoose';

//chr-ref-alt-assembly
const variantAnnotationSchema = new mongoose.Schema(
  {
    alt: {
      type: String
    },
    ref: {
      type: String
    },
    chr: {
      type: String
    },
    assembly: {
      type: String
    },
    aa_changes: {
      type: String
    },
    cdna: {
      type: String
    },
    gene_name: {
      type: String
    },
    gnomad_het: {
      type: Number
    },
    gnomad_hom: {
      type: Number
    },
    transcript: {
      type: String
    }
  }
);

interface VariantAnnotationId {
  alt: string;
  assembly: string;
  chr: string;
  ref: string;
}

variantAnnotationSchema.statics.getAnnotations = async function (annotation: VariantAnnotationId) {
  const variant = await this.find({
    alt: annotation.alt,
    assembly: annotation.assembly,
    chr: annotation.chr,
    ref: annotation.ref
  });

  return variant;
};

const VariantAnnotation = mongoose.model('VariantAnnotation', variantAnnotationSchema);
export default VariantAnnotation;
