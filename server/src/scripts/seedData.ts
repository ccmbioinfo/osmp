import mongoose from 'mongoose';
import VariantAnnotationModel, { VariantAnnotationId } from '../models/VariantAnnotationModel';
import {
  generateNonRandomCoordinates,
  createDummyVariantAnnotations,
  queryManyCoordinates,
} from './seedHelpers';

const MONGO_URL = process.env.MONGO_DATABASE_URL!;

const NON_RANDOM_COORDINATES: VariantAnnotationId[] = generateNonRandomCoordinates(10);

mongoose.connect(MONGO_URL).then(async () => {
  const count = await VariantAnnotationModel.count();
  console.log(`dropping ${count.toLocaleString()} annotations....`);
  await VariantAnnotationModel.deleteMany();

  const newAnnotationCount = 5000;

  console.log(`creating ${newAnnotationCount.toLocaleString()} annotations....`);

  // insert our non-random coordinate as well, bringing the count to newAnnotationCount + 1
  await createDummyVariantAnnotations(newAnnotationCount, NON_RANDOM_COORDINATES);

  await VariantAnnotationModel.createIndexes([
    { alt: 1, assembly: 1, chr: 1, pos: 1, ref: 1 },
    { pos: 1 },
  ]);

  const newCount = await VariantAnnotationModel.count();

  console.log(`there are now ${newCount.toLocaleString()} annotations in the database`);

  const queryCount = 500;

  console.log(`querying annotations with ${queryCount.toLocaleString()} random coordinates`);

  const results = await queryManyCoordinates(120000, 124000, queryCount, NON_RANDOM_COORDINATES);

  console.log(
    `query returned ${results.length.toLocaleString()} of ${newCount.toLocaleString()} annotations`
  );

  process.exit(0);
});
