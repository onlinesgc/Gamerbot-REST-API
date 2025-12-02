import { json, Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import sanitize from "sanitize-filename";
import { generateFrame } from "../helpers/generateFrame";
import { fetchConfig } from "../models/configSchema";
import { fetchGuildConfig } from "../models/guildSchema";

const publicFrameRouter = Router();
publicFrameRouter.use(json());

const cachedFrames = new Map<string, Buffer<ArrayBufferLike>>();

//POST /public_api/frame/generate
//Generates a frame
publicFrameRouter.post("/generate", async (req: Request, res: Response) => {
    if (!req.body) return res.status(400).json({ error: "No body" });

    const name = sanitize(req.body.name);
    const frameId: number = req.body.frameId;
    const hexColor: string = req.body.hexColor || "#000000";
    const level: string = req.body.level || "1";
    const xpPercentage: number = req.body.xpPercentage || 0;
    const memberAvatar: string | null = req.body.memberAvatar || null;
    const guildId: string = req.body.guildId || "516605157795037185";
    const cachedId: string | null = req.body.cachedId || null;

    if (!name) return res.status(400).json({ error: "No name provided" });
    if (frameId == null || isNaN(frameId))
        return res.status(400).json({ error: "Invalid frame ID" });

    if (cachedId) {
        const cachedFrame = cachedFrames.get(cachedId);
        if (cachedFrame) {
            res.setHeader("Content-Type", "image/png");
            return res.send(cachedFrame);
        }
    }
    const frameBuffer = await generateFrame(
        name,
        frameId,
        hexColor,
        level,
        xpPercentage,
        memberAvatar,
        guildId,
    );
    if (!frameBuffer)
        return res.status(500).json({ error: "Failed to generate frame" });
    if (cachedId) {
        cachedFrames.set(cachedId, frameBuffer);
    }
    res.setHeader("Content-Type", "image/png");
    res.send(frameBuffer);
});

//GET /public_api/frame/config
//Returns the config for the frame
publicFrameRouter.get("/config", async (req: Request, res: Response) => {
    const config = await fetchConfig(process.env.API_CONFIG_ID!);
    if (!config) return res.status(500).json({ error: "No config found" });
    const guildConfig = await fetchGuildConfig("516605157795037185");
    if (!guildConfig)
        return res.status(500).json({ error: "No guild config found" });
    const frames = guildConfig.frames.map((frame) => ({
        name: frame.name,
        id: frame.id,
        frameLink: `https://api.sgc.se/public_api/frame/${frame.id}`,
    }));
    const frameConfig = {
        frames: frames,
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
    const frame = guildConfig.frames.find((f) => f.id === frameId);
    if (!frame) return res.status(400).json({ error: "No frame with that ID" });
    const filePath = path.resolve(`./${frame.path}`);
    if (!fs.existsSync(filePath))
        return res.status(400).json({ error: "No frame with that ID" });
    res.download(filePath);
});

export { publicFrameRouter };
