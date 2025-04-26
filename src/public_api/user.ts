import { json, Request, Response, Router } from "express";
import { fetchUser } from "../models/user_schema";

const publicUserRouter = Router();
publicUserRouter.use(json());

//GET /public_api/user/:userid
//Returns the public user data for the given userid
publicUserRouter.get("/:userid", async (req: Request, res: Response) => {
  if (req.params["userid"] == null)
    return res.status(400).json({ error: "No user ID" });

  const guildData = await fetchUser(req.params["userid"], false);

  if (!guildData) {
    return res.status(400).json({ error: "No data with that ID" });
  }

  const publicData = {
    userID: guildData.userId,
    xp: guildData.levelSystem!.xp,
    level: guildData.levelSystem!.level,
    colorHexCode: guildData.frameData!.frameColorHexCode,
    profileFrame: guildData.frameData!.selectedFrame,
    frames: guildData.frameData!.frames,
  };

  return res.json(publicData);
});

export { publicUserRouter };
