import { json, Request, Response, Router } from "express";
import { fetchUser } from "../models/user_schema";

const publicUserRouter = Router();
publicUserRouter.use(json());

//GET /public_api/user/:userid
//Returns the public user data for the given userid
publicUserRouter.get("/:userid", async (req: Request, res: Response) => {
  const guildData = await fetchUser(req.params["userid"]);
  if (!guildData) {
    return res.status(400).json({ error: "No data with that ID" });
  }

  const publicData = {
    userID: guildData.userID,
    serverID: guildData.serverID,
    xp: guildData.xp,
    level: guildData.level,
    colorHexCode: guildData.colorHexCode,
    profileFrame: guildData.profileFrame,
    exclusiveFrames: guildData.exclusiveFrames,
  };

  return res.json(publicData);
});

export { publicUserRouter };
