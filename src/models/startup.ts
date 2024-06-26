import mongoose from "mongoose"

/**
 * connect to mongo database
 */
export const start_mongo_connection = async () => {
    new Promise<void>(resolve =>{
        mongoose.connect(process.env.MONGO_SRV as string,{}).then(()=>{
            resolve();
        })
    })
}