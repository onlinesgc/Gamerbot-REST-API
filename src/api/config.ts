import {Router, Response, Request, NextFunction, json} from "express"
import { fetchConfig } from "../models/configSchema";

var config_router = Router();
config_router.use(json());

//GET /api/config/:configid
//Returns the configuration data for the given configid
config_router.get("/:configid", async (req:Request,res:Response, next:NextFunction) =>{
    let config_data = await fetchConfig(req.params["configid"]);
    if(config_data == null) return res.status(400).json({"error":"No data with that ID"});

    res.json(config_data?.toJSON());
});

//POST /api/config/:configid
//Updates the configuration data for the given configid
config_router.post("/:configid", async (req:Request, res:Response, next:NextFunction) =>{
    let json_body = req.body;
    let config_data = await fetchConfig(req.params['configid']);
    for(let key in json_body){
        if(config_data?.get(key) == null) 
            return res.status(400).json({"error":`no ${key} key was found in the config`});
        config_data.set(key,json_body[key]);
    }
    res.json(config_data);
});

export { config_router as configRouter }