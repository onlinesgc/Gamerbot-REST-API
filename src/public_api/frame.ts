import { json, Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";
import { generateFrame } from "../helpers/generateFrame";
import { fetchConfig } from "../models/config_schema";
import { fetchGuildConfig } from "../models/guild_schema";

const publicFrameRouter = Router();
publicFrameRouter.use(json());

//POST /public_api/frame/generate
//Generates a frame
publicFrameRouter.post("/generate", async (req: Request, res: Response) => {
  if (req.body == null) return res.status(400).json({ error: "No body" });
  const jsonBody = req.body;
  if (
    jsonBody.userId == null ||
    jsonBody.frameId == null ||
    jsonBody.hexColor == null ||
    jsonBody.username == null ||
    jsonBody.level == null ||
    jsonBody.xpPercentage == null
  )
    return res.status(400).json({ error: "Missing parameters" });

  const { userId, frameId, hexColor, username, level, xpPercentage } = jsonBody;

  const memberAvatar = jsonBody.memberAvatar || null;

  const force = jsonBody.force || false;

  const config = await fetchConfig(process.env.API_CONFIG_ID!);
  const guildConfig = await fetchGuildConfig("516605157795037185");

  if (frameId > guildConfig!.frames.length - 1)
    return res.status(400).json({ error: "Invaild frame id" });

  if (hexColor.length !== 7 || hexColor[0] !== "#")
    return res.status(400).json({ error: "Invaild hex color" });

  const cachePath = path.join("./cache");
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath);
  }
  const cachedFrameObject = config?.cachedGeneratedFrames.find(
    (frame) =>
      frame.userId === userId &&
      frame.frameId === frameId &&
      frame.hexColor === hexColor &&
      frame.username === username &&
      frame.level === level &&
      frame.xpPercentage === xpPercentage &&
      frame.memberAvatar === memberAvatar,
  );
  if (cachedFrameObject && !force) {
    const filePath = path.join(cachePath, `${sanitize(userId)}.png`);
    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }
  } else {
    const oldIndex = config?.cachedGeneratedFrames.findIndex(
      (frame) => frame.userId === userId,
    );
    if (oldIndex !== -1) {
      config?.cachedGeneratedFrames.splice(oldIndex!, 1);
    }
  }
  const filePath = path.join(cachePath, `${sanitize(userId)}.png`);
  const framePhoto = await generateFrame(
    username,
    frameId,
    hexColor,
    level,
    xpPercentage,
    memberAvatar,
  );
  if (!framePhoto)
    return res.status(500).json({ error: "Failed to generate frame" });

  fs.writeFileSync(filePath, framePhoto);
  config?.cachedGeneratedFrames.push({
    userId: userId,
    frameId: frameId,
    hexColor: hexColor,
    username: username,
    level: level,
    xpPercentage: xpPercentage,
    memberAvatar: memberAvatar,
  });
  if (config!.cachedGeneratedFrames.length > 5) {
    config?.cachedGeneratedFrames.shift();
  }
  await config?.save();
  return res.download(filePath);
});

//GET /public_api/frame/config
//Returns the config for the frame
publicFrameRouter.get("/config", async (req: Request, res: Response) => {
  const config = await fetchConfig(process.env.API_CONFIG_ID!);
  if (!config) return res.status(500).json({ error: "No config found" });
  const guildConfig = await fetchGuildConfig("516605157795037185");
  if (!guildConfig)
    return res.status(500).json({ error: "No guild config found" });
  const frameConfig = {
    frames: guildConfig.frames,
  };
  return res.json(frameConfig);
});

//GET /public_api/frame/:frameId
//Returns the frame for the given frameId
publicFrameRouter.get("/:frameId", async (req: Request, res: Response) => {
  if (req.params["frameId"] == null)
    return res.status(400).json({ error: "No frame ID" });
  const frameId = parseInt(req.params["frameId"]);
  if (isNaN(frameId))
    return res.status(400).json({ error: "Invalid frame ID" });
  const guildConfig = await fetchGuildConfig("516605157795037185");
  if (!guildConfig)
    return res.status(500).json({ error: "No guild config found" });
  if (frameId > guildConfig.frames.length - 1)
    return res.status(400).json({ error: "Invalid frame ID" });
  const frame = guildConfig.frames[frameId];
  if (!frame) return res.status(400).json({ error: "No frame with that ID" });
  const filePath = path.resolve("./") + frame.path;
  if (!fs.existsSync(filePath))
    return res.status(400).json({ error: "No frame with that ID" });
  res.download(filePath);
});

export { publicFrameRouter };
