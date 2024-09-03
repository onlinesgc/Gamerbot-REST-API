import { json, Request, Response, Router } from "express";
import { fetch_user } from "../models/user_schema";
import fs from "fs";
import { generateFrame } from "../functions/generateFrame";
import { fetch_config } from "../models/config_schema";
import path from "path";

var public_user_router = Router();
public_user_router.use(json());
//GET /public_api/user/:userid
//Returns the public user data for the given userid
public_user_router.get("/:userid", async (req:Request, res:Response) => {
    let guild_data = await fetch_user(req.params["userid"]);
    if(guild_data == null) return res.status(400).json({"error":"No data with that ID"});

    let public_data = {
        userID: guild_data.userID,
        serverID: guild_data.serverID,
        xp: guild_data.xp,
        level: guild_data.level,
        colorHexCode: guild_data.colorHexCode,
        profileFrame: guild_data.profileFrame,
        exclusiveFrames: guild_data.exclusiveFrames
    };

    return res.json(public_data);
});

//POST /public_api/user/frame
//Returns the generated frame for the user
public_user_router.post("/frame", async (req:Request, res:Response) =>{
    if(req.body == null) return res.status(400).json({"error":"Missing body"});
    let json_body = req.body;
    if(
        json_body.userid == null || 
        json_body.frame_id == null || 
        json_body.hex_color == null ||
        json_body.username == null ||
        json_body.level == null ||
        json_body.xp_percentage == null
    ) return res.status(400).json({"error":"Missing fields"});

    let config = await fetch_config(process.env.API_CONFIG_ID as string);

    let member_avatar_url = (json_body.avatar_url != null) ? json_body.avatar_url : null;

    let cache_path = path.resolve("./") + "/cache";
    if(!fs.existsSync(cache_path)){
        fs.mkdirSync(cache_path);
    }

    if(!fs.existsSync(`${cache_path}/${json_body.userid}.png`) || (json_body.force != null && json_body.force == true)){
        let photo = await generateFrame(json_body.username, json_body.frame_id, json_body.hex_color, json_body.level, json_body.xp_percentage,member_avatar_url);
        if(photo == null) return res.status(500).json({"error":"Error generating photo"});
        const fiels = fs.readdirSync(cache_path);
        if(fiels.length > 100){
            let id = (config.cacheQueue as unknown as Array<any>).shift();
            fs.rmSync(`${cache_path}/${id}.png`);
        }
        await writeFile(`${cache_path}/${json_body.userid}.png`,photo as any);
        if(!(config.cacheQueue as unknown as Array<any>).includes(json_body.userid))
            (config.cacheQueue as unknown as Array<any>).push(json_body.userid);
        config.save();

    }
    res.sendFile(`${cache_path}/${json_body.userid}.png`);
})

function writeFile(path:string, data:any){
    return new Promise((resolve,reject) =>{
        fs.writeFile(path,data,(err) =>{
            if(err) {
                console.error(err);
                reject(err);
            }
            resolve(true);
        });
    })
}

export { public_user_router };
