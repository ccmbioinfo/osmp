import mongoose from 'mongoose';
import VariantAnnotation from './variantAnnotation';
import createDummyVariantAnnotations from './seedData';
const connectDb = () => {
  return mongoose.connect(process.env.MONGO_DATABASE_URL!);
};

const models = {
  VariantAnnotation,
};

export { connectDb, createDummyVariantAnnotations };
export default models;
