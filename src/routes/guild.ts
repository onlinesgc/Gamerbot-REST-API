import { json, Request, Response, Router } from "express";
import { fetchGuildConfig, updateGuildConfig } from "../models/guildSchema";

const guildRouter = Router();
guildRouter.use(json());

//GET /api/guild/:guildid
//Returns the guild configuration data for the given guildid
guildRouter.get("/:guildid", async (req: Request, res: Response) => {
    if (req.params["guildid"] == null)
        return res.status(400).json({ error: "No guild ID" });

    const guildData = await fetchGuildConfig(req.params["guildid"]);

    if (guildData == null)
        return res.status(400).json({ error: "No data with that ID" });

    return res.json(guildData.toJSON());
});

//POST /api/guild/:guildid
//Updates the guild configuration data for the given guildid
guildRouter.post("/:guildid", async (req: Request, res: Response) => {
    const jsonBody = req.body;

    const updatedGuildConfig = await updateGuildConfig(
        req.params["guildid"],
        jsonBody,
    );

    if (!updatedGuildConfig) {
        return res.status(400).json({ error: "Failed to update guild config" });
    }

    res.json(updatedGuildConfig.toJSON());
});

export { guildRouter };
