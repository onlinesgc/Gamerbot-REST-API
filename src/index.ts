import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { start_mongo_connection } from "./models/startup";
import { configRouter } from "./api/config";

//setup environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

var temp_api_keys = ['test']; //DEBUG Move to database

//Interfaces for classes
interface keyRequest extends Request{
    key?:string
}

//Middleware for API keys
app.use("/api",(req:keyRequest, res:Response, next:NextFunction) =>{
    let headers = req.headers['authorization'];
    if(!headers) return res.status(401).json({"error":"No API token"})

    let key = headers.split(' ')[1];

    if(temp_api_keys.indexOf(key) === -1) return res.status(401).json({"error":"Wrong API token"})

    req.key = key;
    next();
});

//routers
app.use("/api/config", configRouter);

app.get("/", (req:Request, res:Response) =>{
    res.json({service:"OK"})
});

app.listen(PORT, async () =>{
    await start_mongo_connection();
    console.log(`[server]: Server and datamodel is running at http://localhost:${PORT}`);
});
