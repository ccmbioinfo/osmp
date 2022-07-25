import mongoose, { Model, model } from 'mongoose';
import {
  GnomadBaseAnnotation,
  GnomadGenomeAnnotation,
  GnomadGRCh37ExomeAnnotation,
  VariantCoordinate,
} from '../types';

type AnnotationInput = {
  start: number;
  end: number;
  coordinates: VariantCoordinate[];
};

interface GnomadAnnotations<T> {
  primaryAnnotations: T[];
  secondaryAnnotations: GnomadGenomeAnnotation[];
}

interface GnomadAnnotationStaticMethods<T> {
  getAnnotations(ids: AnnotationInput): Promise<GnomadAnnotations<T>>;
}

type GnomadGRCh37ExomeAnnotationModel = Model<GnomadGRCh37ExomeAnnotation> &
  GnomadAnnotationStaticMethods<GnomadGRCh37ExomeAnnotation>;
type GnomadGenomeAnnotationModel = Model<GnomadGenomeAnnotation> &
  GnomadAnnotationStaticMethods<GnomadGenomeAnnotation>;

const gnomadAnnotationBaseSchema = new mongoose.Schema<
  GnomadBaseAnnotation,
  Model<GnomadBaseAnnotation>
>({
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
    type: Number,
  },
  af: {
    type: Number,
  },
});

const gnomadGenomeBaseSchema = new mongoose.Schema<
  GnomadGenomeAnnotation,
  Model<GnomadGenomeAnnotation>
>({
  ...gnomadAnnotationBaseSchema.obj,
  ac: {
    type: Number,
  },
});

const GnomadGRCh37AnnotationSchema = new mongoose.Schema<
  GnomadGRCh37ExomeAnnotation,
  GnomadGRCh37ExomeAnnotationModel
>({
  ...gnomadAnnotationBaseSchema.obj,
  an: {
    type: Number,
  },
  cdna: {
    type: String,
  },
  transcript: {
    type: String,
  },
});

const GnomadGRCh37GenomeAnnotationSchema = new mongoose.Schema<
  GnomadGenomeAnnotation,
  GnomadGenomeAnnotationModel
>({ ...gnomadGenomeBaseSchema.obj });

const GnomadGRCh38AnnotationSchema = new mongoose.Schema<
  GnomadGenomeAnnotation,
  GnomadGenomeAnnotationModel
>({ ...gnomadGenomeBaseSchema.obj });

const getAnnotations = async (
  model: GnomadGenomeAnnotationModel | GnomadGRCh37ExomeAnnotationModel,
  ids: AnnotationInput,
  omittedFields: string[]
) => {
  const { start, end, coordinates } = ids;

  if (!coordinates.length) return [];

  return await model.aggregate([
    { $match: { pos: { $gte: start, $lte: end } } },
    { $match: { $or: coordinates } },
    {
      $project: Object.fromEntries([...omittedFields, '_id', 'assembly', 'type'].map(f => [f, 0])),
    },
  ]);
};

GnomadGRCh37AnnotationSchema.statics.getAnnotations = async function (ids: AnnotationInput) {
  const exomeAnnotations = await getAnnotations(this, ids, ['filter', 'gene']);
  const genomeAnnotations = await getAnnotations(GnomadGRCh37GenomeAnnotationModel, ids, [
    'gene',
    'source',
  ]);

  console.log(
    `${exomeAnnotations.length} GRCh37 exome gnomAD annotation${
      exomeAnnotations.length === 1 ? '' : 's'
    } found`
  );
  console.log(
    `${genomeAnnotations.length} GRCh37 genome gnomAD annotation${
      genomeAnnotations.length === 1 ? '' : 's'
    } found`
  );

  return {
    primaryAnnotations: exomeAnnotations,
    secondaryAnnotations: genomeAnnotations,
  };
};

GnomadGRCh38AnnotationSchema.statics.getAnnotations = async function (ids: AnnotationInput) {
  const genomeAnnotations = await getAnnotations(this, ids, ['source']);

  console.log(
    `${genomeAnnotations.length} GRCh38 genome gnomAD annotation${
      genomeAnnotations.length === 1 ? '' : 's'
    } found`
  );

  return {
    primaryAnnotations: genomeAnnotations,
    secondaryAnnotations: [],
  };
};

export const GnomadGRCh37AnnotationModel = model<
  GnomadGRCh37ExomeAnnotation,
  GnomadGRCh37ExomeAnnotationModel
>('GnomadGRCh37ExomeAnnotation', GnomadGRCh37AnnotationSchema, 'GRCh37ExomeAnnotations');

const GnomadGRCh37GenomeAnnotationModel = model<
  GnomadGenomeAnnotation,
  GnomadGenomeAnnotationModel
>('GnomadGRCh37GenomeAnnotation', GnomadGRCh37GenomeAnnotationSchema, 'GRCh37GenomeAnnotations');

export const GnomadGRCh38AnnotationModels = [
  ...Array.from({ length: 22 }, (_, i) => `${i + 1}`),
  'X',
  'Y',
].reduce((modelMapping, chr) => {
  modelMapping[chr] = model<GnomadGenomeAnnotation, GnomadGenomeAnnotationModel>(
    `GnomadGRCh38GenomeAnnotation_chr${chr}`,
    GnomadGRCh38AnnotationSchema,
    `GRCh38GenomeAnnotations_chr${chr}`
  );

  return modelMapping;
}, {} as { [key: string]: GnomadGenomeAnnotationModel });
