import mongoose, { Document, Model, model } from 'mongoose';
import { VariantAnnotation } from '../types';

export type VariantAnnotationId = Pick<VariantAnnotation, 'alt' | 'chrom' | 'ref' | 'pos'>;

interface VariantAnnotationDocument extends Document, VariantAnnotation {}

const variantAnnotationSchema = new mongoose.Schema({
  alt: {
    type: String,
  },
  ref: {
    type: String,
  },
  chrom: {
    type: String,
  },
  pos: {
    type: Number,
  },
  assembly: {
    type: String, // The two possible values for assembly is 'GRCh37' and 'GRCh38'. Changing this to an int versus string increases query speed for large dataset.
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
  getAnnotations(coordinates: string, assemblyId: string): Promise<VariantAnnotation[]>;
}

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<VariantAnnotationDocument>,
  coordinates: string,
  assemblyId: string
) {
  // Format from remote node aka stager: position: '19:44905791-44909393', assemblyId: 'GRCh37'

  if (coordinates && assemblyId) {
    const position = coordinates.split(':')[1].split('-');
    const start = Number(position[0]);
    const end = Number(position[1]);
    const chromosome = coordinates.split(':')[0];

    const annotation = await this.find({
      pos: { $gte: start, $lte: end },
      chrom: chromosome,
      assembly: assemblyId,
    });

    return annotation;
  } else {
    return [];
  }
};

const VariantAnnotationModel = model<VariantAnnotationDocument, VariantAnnotationModelMethods>(
  'VariantAnnotation',
  variantAnnotationSchema
);

export default VariantAnnotationModel;
