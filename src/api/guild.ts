import { json, Request, Response, Router } from "express";
import {
  create_guild_config,
  fetch_guild_config,
} from "../models/guild_schema";
import { createTokenLog } from "../models/token_log_schema";

const guildRouter = Router();
guildRouter.use(json());

//GET /api/guild/:guildid
//Returns the guild configuration data for the given guildid
guildRouter.get("/:guildid", async (req: Request, res: Response) => {
  createTokenLog(
    req.headers["authorization"] as string,
    "GET /api/guild/:guildid",
    new Date(),
    { guildid: req.params["guildid"] },
  );
  const guildData = await fetch_guild_config(req.params["guildid"]);
  if (guildData == null)
    return res.status(400).json({ error: "No data with that ID" });

  return res.json(guildData.toJSON());
});

//POST /api/guild/:guildid
//Updates the guild configuration data for the given guildid
guildRouter.post("/:guildid", async (req: Request, res: Response) => {
  const jsonBody = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/guild/:guildid",
    new Date(),
    { guildid: req.params["guildid"], body: jsonBody },
  );
  const guildData = await fetch_guild_config(req.params["guildid"]);
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

//POST /api/guild/:guildid/add_obj
//Adds an object to the extraObjects map in the guild configuration data for the given guildid
guildRouter.post("/:guildid/add_obj", async (req: Request, res: Response) => {
  const jsonBody = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/guild/:guildid/add_obj",
    new Date(),
    { guildid: req.params["guildid"], body: jsonBody },
  );
  const guildData = await fetch_guild_config(req.params["guildid"]);

  if (jsonBody.value == null || jsonBody.key == null)
    return res.status(400).json({ error: "No value key in body" });

  guildData?.extraObjects.set(jsonBody.key, jsonBody.value);
  guildData?.save();
  res.json(guildData?.toJSON());
});

//DELETE /api/guild/:guildid/remove_obj
//Removes an object from the extraObjects map in the guild configuration data for the given guildid
guildRouter.delete(
  "/:guildid/remove_obj",
  async (req: Request, res: Response) => {
    const jsonBody = req.body;
    createTokenLog(
      req.headers["authorization"] as string,
      "DELETE /api/guild/:guildid/remove_obj",
      new Date(),
      { guildid: req.params["guildid"], body: jsonBody },
    );

    const guildData = await fetch_guild_config(req.params["guildid"]);
    if (!guildData) {
      return res.status(400).json({ error: "No guild data" });
    }

    if (jsonBody?.key == null) {
      return res.status(400).json({ error: "No key key in guild data" });
    }

    guildData?.extraObjects.delete(jsonBody.key);
    guildData?.save();
    res.json(guildData?.toJSON());
  },
);

//POST /api/guild/create
//Creates a new guild configuration data for the given guildid
guildRouter.post("/create", async (req: Request, res: Response) => {
  const jsonBody = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/guild/create",
    new Date(),
    { body: jsonBody },
  );
  const guildData = await fetch_guild_config(jsonBody.guildID);
  if (guildData != null)
    return res.status(400).json({ error: "Guild data already exists" });

  const newGuildData = await create_guild_config(jsonBody.guildID);
  res.json(newGuildData?.toJSON());
});

export { guildRouter };
