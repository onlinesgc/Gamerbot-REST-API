import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { startServer } from "./models/startup";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

var temp_api_keys = ['test']; //Move to database

interface Error {
    status?: number;
}
interface keyRequest extends Request{
    key?:string
}

app.use("/api",(req:keyRequest, res:Response, next:NextFunction) =>{
    let headers = req.headers['authorization'];
    
    if(!headers) return next(error(400,"api key required"));

    let key = headers.split(' ')[1];

    if(temp_api_keys.indexOf(key) === -1) return next(error(401, 'invaild api key'));

    req.key = key;
    next();
});

app.get("/", (req:Request, res:Response) =>{
    res.json({service:"OK"})
});


app.listen(PORT, async () =>{
    await startServer();
    console.log(`[server]: Server and datamodel is running at http://localhost:${PORT}`);
});

function error(status:number, msg:string){
    let err = new Error(msg) as Error
    err.status = status; 
    return err;
}

