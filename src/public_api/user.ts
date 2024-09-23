import { json, Request, Response, Router } from "express";
import { fetch_user } from "../models/user_schema";
import fs from "fs";
import { generateFrame } from "../functions/generateFrame";
import { fetch_config } from "../models/config_schema";
import path from "path";
import sanitize from "sanitize-filename";
import { buffer } from "stream/consumers";

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

//POST /public_api/user/frame
//Returns the generated frame for the user
public_user_router.post("/frame", async (req: Request, res: Response) => {
  if (req.body == null) return res.status(400).json({ error: "Missing body" });
  const json_body = req.body;
  if (
    json_body.userid == null ||
    json_body.frame_id == null ||
    json_body.hex_color == null ||
    json_body.username == null ||
    json_body.level == null ||
    json_body.xp_percentage == null
  )
    return res.status(400).json({ error: "Missing fields" });

  const config = await fetch_config(process.env.API_CONFIG_ID as string);

  const member_avatar_url =
    json_body.avatar_url != null ? json_body.avatar_url : null;

  const cache_path = path.resolve("./cache");

  if (!fs.existsSync(cache_path)) {
    fs.mkdirSync(cache_path);
  }

  const user_id = sanitize(json_body.userid);

  if (
    !(config.cacheQueue as unknown as Array<string>).includes(user_id) ||
    json_body?.force == true
  ) {
    const photo = await generateFrame(
      json_body.username,
      json_body.frame_id,
      json_body.hex_color,
      json_body.level,
      json_body.xp_percentage,
      member_avatar_url,
    );
    if (photo == null)
      return res.status(500).json({ error: "Error generating photo" });
    const fiels = fs.readdirSync(cache_path);
    if (fiels.length > 100) {
      const id = (config.cacheQueue as unknown as Array<string>).shift();
      fs.rmSync(`${cache_path}/${id}.png`);
    }

    fs.writeFileSync(`${cache_path}/${user_id}.png`, photo);

    if (
      !(config.cacheQueue as unknown as Array<string>).includes(
        user_id,
      )
    )
      (config.cacheQueue as unknown as Array<string>).push(user_id);
    config.save();
  }else{
    const check_file = fs.realpathSync(path.resolve(cache_path, user_id + ".png"));
    if(!check_file.startsWith(cache_path)) {
      return res.status(400).json({ error: "Invalid path" });
    }
  }
  res.sendFile(`${cache_path}/${json_body.userid}.png`);
});


export { public_user_router };
