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
    type: Number,
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

// For model
interface GnomadAnnotationModelMethods extends Model<GnomadAnnotation> {
  getAnnotations(coordinates: string, assemblyId: string): Promise<GnomadAnnotation[]>;
}

variantAnnotationSchema.statics.getAnnotations = async function (
  this: Model<GnomadAnnotationDocument>,
  coordinates: string,
  assemblyId: string
) {
  // Format from remote node aka stager: position: '19:44905791-44909393', assemblyId: 'GRCh37'

  console.log(coordinates, assemblyId);

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

    console.log(
      {
        pos: { $gte: start, $lte: end },
        chrom: chromosome,
        assembly: assemblyId,
      },
      annotation
    );

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
