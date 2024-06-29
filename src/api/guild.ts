import { Router, json , Request, Response} from "express";
import { create_guild_config, fetch_guild_config } from "../models/guild_schema";


var guild_router = Router();
guild_router.use(json());

//GET /api/guild/:guildid
//Returns the guild configuration data for the given guildid
guild_router.get("/:guildid", async (req:Request, res:Response) => {
    let guild_data = await fetch_guild_config(req.params["guildid"]);
    if(guild_data == null) return res.status(400).json({"error":"No data with that ID"});

    return res.json(guild_data.toJSON());
});

//POST /api/guild/:guildid
//Updates the guild configuration data for the given guildid
guild_router.post("/:guildid", async (req:Request, res:Response) =>{
    let json_body = req.body;
    let guild_data = await fetch_guild_config(req.params['guildid']);
    for(let key in json_body){
        if(guild_data?.get(key) == null) 
            return res.status(400).json({"error":`no ${key} key was found in the guild data`});
        guild_data.set(key,json_body[key]);
    }
    res.json({"message":"Updated guild data"});
    guild_data?.save();
});



//POST /api/guild/:guildid/add_obj
//Adds an object to the extraObjects map in the guild configuration data for the given guildid
guild_router.post("/:guildid/add_obj", async (req:Request, res:Response) =>{
    let json_body = req.body;
    let guild_data = await fetch_guild_config(req.params['guildid']);

    if(json_body.value == null || json_body.key == null) 
        return res.status(400).json({"error":"No value key in body"});

    guild_data?.extraObjects.set(json_body.key,json_body.value);
    guild_data?.save();
    res.json(guild_data?.toJSON());
})


//DELETE /api/guild/:guildid/remove_obj
//Removes an object from the extraObjects map in the guild configuration data for the given guildid
guild_router.delete("/:guildid/remove_obj", async (req:Request, res:Response) =>{
    let json_body = req.body;
    let guild_data = await fetch_guild_config(req.params['guildid']);

    if(json_body.key == null) 
        return res.status(400).json({"error":"No key key in guild data"});

    guild_data?.extraObjects.delete(json_body.key);
    guild_data?.save();
    res.json(guild_data?.toJSON());
})


//POST /api/guild/create
//Creates a new guild configuration data for the given guildid
guild_router.post("/create", async (req:Request, res:Response) =>{
    let json_body = req.body;
    let guild_data = await fetch_guild_config(json_body.guildID);
    if(guild_data != null) return res.status(400).json({"error":"Guild data already exists"});

    let new_guild_data = await create_guild_config(json_body.guildID);
    res.json(new_guild_data?.toJSON());
})

export { guild_router }