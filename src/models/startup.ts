import mongoose from "mongoose";
/**
 * connect to mongo database
 */
export const startMongoConnection = async () => {
  await mongoose.connect(process.env.MONGO_URL);
};
