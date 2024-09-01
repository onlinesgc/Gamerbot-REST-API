import { Request, Response, Router } from "express";
import { fetch_user } from "../models/user_schema";

var public_user_router = Router();

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

export { public_user_router };
