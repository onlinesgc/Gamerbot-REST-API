import mongoose from "mongoose";
/**
 * connect to mongo database
 */
export const startMongoConnection = async () => {
    if (process.env.DEBUG === "true") {
        await mongoose.connect(process.env.MONGO_URL_TESTDATABASE!);
        return;
    } else {
        await mongoose.connect(process.env.MONGO_URL);
    }
};
