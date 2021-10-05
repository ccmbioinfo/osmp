import Faker from 'faker';
import logger from '../logger';
import mongoose from 'mongoose';
import {
  variantAnnotationSchema,
  VariantAnnotationCoordinates,
  VariantAnnotationDocument,
  VariantAnnotationModel,
} from './variantAnnotation';

const generateRandomCoordinates: () => VariantAnnotationCoordinates = () => {
  const bases = ['A', 'T', 'C', 'G'];
  const ref = Faker.helpers.randomize(bases);
  const alt = Faker.helpers.randomize(bases.filter(b => b !== ref));
  const chr = Faker.helpers.randomize([...Array(24).keys()].map(x => x + 1));
  const assembly = Faker.helpers.randomize([37, 38]);
  return {
    assembly: assembly,
    alt: alt,
    chr: chr,
    ref: ref,
  };
};

/**
 * @param model: Each Mongoose model is scoped to a single connection only. To use this function, a connection must be established beforehand.
 * The function generates seed dummy data when the mongo service starts in Docker and no data has been found in the database.
 */

const createDummyVariantAnnotations = async (model: VariantAnnotationModel) => {
  const variants = Array(5000)
    .fill(null)
    .map(() => {
      const coordinates = generateRandomCoordinates();
      const bases = ['A', 'T', 'C', 'G'];
      const ref = coordinates.ref;
      const alt = coordinates.alt;
      const chr = coordinates.chr;
      const assembly = coordinates.assembly;
      const aaChanges = `Z[${ref}GC] > Y[${alt}GC]`;
      const cdna = Array(100)
        .fill(null)
        .map(() => Faker.helpers.randomize(bases))
        .join('');
      const geneName = 'SOME_GENE_NAME';
      const gnomadHet = Faker.datatype.float({ min: 0, max: 1, precision: 5 });
      const gnomadHom = Faker.helpers.randomize([0, 0, 0, 0, 0, 1, 2]);
      const transcript = `ENSTFAKE${Faker.datatype.number({ min: 10000, max: 20000 })}`;
      return {
        alt: alt,
        ref: ref,
        chr: chr,
        assembly: assembly,
        aa_changes: aaChanges,
        cdna: cdna,
        gene_name: geneName,
        gnomad_het: gnomadHet,
        gnomad_hom: gnomadHom,
        transcript: transcript,
      };
    });
  try {
    console.log(variants);
    await model.create(variants);
  } catch (err) {
    logger.error(err);
  }
};

const queryManyCoordinates = async (model: VariantAnnotationModel) => {
  const coordinates = Array(1000)
    .fill(null)
    .map(() => generateRandomCoordinates());
  console.log(coordinates);
  try {
    const annotations = await model.find({ $or: coordinates }).explain('executionStats');
    console.log(annotations);
  } catch (err) {
    logger.error(err);
  }
};

const MONGO_URL = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:${process.env.MONGO_INITDB_PORT}`;

mongoose.connect(MONGO_URL!).then(async () => {
  const model = mongoose.model<VariantAnnotationDocument, VariantAnnotationModel>(
    'VariantAnnotation',
    variantAnnotationSchema
  );
  const eraseDatabaseOnSync = false;
  if (eraseDatabaseOnSync) {
    await Promise.all([model.deleteMany({})]);
    createDummyVariantAnnotations(model);
    model.createIndexes([
      {
        assembly: 1,
        alt: 1,
        chr: 1,
        ref: 1,
      },
    ]);
  }
  queryManyCoordinates(model);
});

export default createDummyVariantAnnotations;
