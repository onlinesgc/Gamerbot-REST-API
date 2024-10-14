import { json, Request, Response, Router } from "express";
import { fetch_user } from "../models/user_schema";

const public_user_router = Router();
public_user_router.use(json());

//GET /public_api/user/:userid
//Returns the public user data for the given userid
public_user_router.get("/:userid", async (req: Request, res: Response) => {
    const guild_data = await fetch_user(req.params["userid"]);
    if (guild_data == null)
        return res.status(400).json({ error: "No data with that ID" });

    const public_data = {
        userID: guild_data.userID,
        serverID: guild_data.serverID,
        xp: guild_data.xp,
        level: guild_data.level,
        colorHexCode: guild_data.colorHexCode,
        profileFrame: guild_data.profileFrame,
        exclusiveFrames: guild_data.exclusiveFrames,
    };

    return res.json(public_data);
});


export { public_user_router };
