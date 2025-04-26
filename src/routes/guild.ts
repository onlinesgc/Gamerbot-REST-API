import { json, Request, Response, Router } from "express";
import { fetchGuildConfig } from "../models/guild_schema";

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

  const guildData = await fetchGuildConfig(req.params["guildid"]);
  for (const key in jsonBody) {
    if (guildData?.get(key) == null)
      return res
        .status(400)
        .json({ error: `no ${key} key was found in the guild data` });
    guildData.set(key, jsonBody[key]);
  }
  res.json({ message: "Updated guild data" });
  guildData?.save();
});

export { guildRouter };
