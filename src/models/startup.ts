import mongoose from "mongoose";

/**
 * connect to mongo database
 */
export const start_mongo_connection = async () => {
  await mongoose.connect(process.env.MONGO_URL);
};
