import mongoose from "mongoose"

export const startServer = async () => {
    new Promise<void>(resolve =>{
        mongoose.connect(process.env.MONGO_SRV as string,{}).then(()=>{
            resolve();
        })
    })
}