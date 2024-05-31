import {Router, Response, Request, NextFunction} from "express"
import {error} from '../index'
import { fetchConfig } from "../models/configSchema";

export var configRouter = Router();

configRouter.get("/:configid", async (req:Request,res:Response, next:NextFunction) =>{
    let configData = await fetchConfig(req.params["configid"]);
    if(configData == null) return res.status(400).json({"error":"No data with that ID"});

    res.json(configData?.toJSON())
})