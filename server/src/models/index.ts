import mongoose from 'mongoose';
import VariationAnnotation from './variantAnnotation';
const connectDb = () => {
  return mongoose.connect(process.env.ME_DATABASE_URL!);
};

const models = {
  VariationAnnotation
};

export { connectDb };
export default models;
