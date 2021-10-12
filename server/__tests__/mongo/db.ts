import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { VariantAnnotation as VariantAnnotationModel } from '../../src/models';
import { VariantAnnotationId } from '../../src/models/VariantAnnotationModel';
import { createDummyVariantAnnotations, generateNonRandomCoordinates } from '../../src/scripts/seedHelpers';

let mongoServer: MongoMemoryServer;

// Connect to db
export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = await mongoServer.getUri();

  console.log(uri)

  await mongoose.connect(uri);

  await seedMockData();
}

const seedMockData = async () => {
  const NON_RANDOM_COORDINATES: VariantAnnotationId[] = generateNonRandomCoordinates(1);

  await createDummyVariantAnnotations(100, NON_RANDOM_COORDINATES);

  await VariantAnnotationModel.createIndexes([
    { alt: 1, assembly: 1, chr: 1, pos: 1, ref: 1 },
    { pos: 1 },
  ]);
}

// Disconnect and close connection
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

// Clear database and remove all data
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
