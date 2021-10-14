import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Connect to db
export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = await mongoServer.getUri();

  console.log(uri);

  await mongoose.connect(uri);
};

// Disconnect and close connection
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

// Clear database and remove all data
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
