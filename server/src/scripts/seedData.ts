import Faker from 'faker';
import mongoose from 'mongoose';
import VariantAnnotationModel, { VariantAnnotationId } from '../models/VariantAnnotationModel';

const generateRandomCoordinate = () => {
  const bases = ['A', 'T', 'C', 'G'];
  const ref = Faker.helpers.randomize(bases);
  const alt = Faker.helpers.randomize(bases.filter(b => b !== ref));
  const chr = Faker.helpers.randomize([...Array(24).keys()].map(x => x + 1));
  const pos = Faker.datatype.number({ min: 0, max: 5000000 });
  const assembly = Faker.helpers.randomize([37, 38]);
  return {
    alt,
    assembly,
    chr,
    pos,
    ref,
  };
};

const createDummyVariantAnnotations = async (
  count: number,
  nonRandomCoordinate?: VariantAnnotationId
) => {
  const variants = Array(count)
    .fill(null)
    .map(() => {
      const { assembly, alt, ref, pos, chr } = generateRandomCoordinate();
      const cdna = Array(100)
        .fill(null)
        .map(() => Faker.helpers.randomize(['A', 'T', 'C', 'G']))
        .join('');
      return {
        alt,
        assembly,
        chr,
        pos,
        ref,
        aa_changes: `Z[${ref}GC] > Y[${alt}GC]`,
        cdna,
        gene_name: 'SOME_GENE_NAME',
        gnomad_het: Faker.datatype.float({ min: 0, max: 1, precision: 5 }),
        gnomad_hom: Faker.helpers.randomize([0, 0, 0, 0, 0, 1, 2]),
        transcript: `ENSTFAKE${Faker.datatype.number({ min: 10000, max: 20000 })}`,
      };
    })
    .concat(
      nonRandomCoordinate
        ? {
            ...nonRandomCoordinate,
            aa_changes: `Z[${nonRandomCoordinate.ref}GC] > Y[${nonRandomCoordinate.alt}GC]`,
            cdna: 'ABC',
            gene_name: 'SOME_GENE_NAME',
            gnomad_het: Faker.datatype.float({ min: 0, max: 1, precision: 5 }),
            gnomad_hom: Faker.helpers.randomize([0, 0, 0, 0, 0, 1, 2]),
            transcript: `ENSTFAKE${Faker.datatype.number({ min: 10000, max: 20000 })}`,
          }
        : []
    );
  return VariantAnnotationModel.create(variants);
};

const queryManyCoordinates = async (count: number, nonRandomCoordinate?: VariantAnnotationId) => {
  const coordinates = Array(count)
    .fill(null)
    .map(() => generateRandomCoordinate())
    .concat(nonRandomCoordinate || []);
  const stats = await VariantAnnotationModel.find({ $or: coordinates }).explain('executionStats');
  console.log(stats);

  return VariantAnnotationModel.find({ $or: coordinates });
};

const MONGO_URL = process.env.MONGO_DATABASE_URL!;

const NON_RANDOM_COORDINATE: VariantAnnotationId = {
  alt: 'T',
  ref: 'A',
  assembly: 19,
  chr: 1,
  pos: 123456,
};

mongoose.connect(MONGO_URL).then(async () => {
  const count = await VariantAnnotationModel.count();
  console.log(`dropping ${count.toLocaleString()} annotations....`);
  await VariantAnnotationModel.deleteMany();

  const newAnnotationCount = 5000;

  console.log(`creating ${newAnnotationCount.toLocaleString()} annotations....`);

  // insert our non-random coordinate as well, bringing the count to newAnnotationCount + 1
  await createDummyVariantAnnotations(newAnnotationCount, NON_RANDOM_COORDINATE);

  await VariantAnnotationModel.createIndexes([{ alt: 1, assembly: 1, chr: 1, pos: 1, ref: 1 }]);

  const newCount = await VariantAnnotationModel.count();

  console.log(`there are now ${newCount.toLocaleString()} annotations in the database`);

  const queryCount = 500;

  console.log(`querying annotations with ${queryCount.toLocaleString()} random coordinates`);

  const results = await queryManyCoordinates(queryCount, NON_RANDOM_COORDINATE);

  console.log(
    `query returned ${results.length.toLocaleString()} of ${newCount.toLocaleString()} annotations`
  );

  process.exit(0);
});
