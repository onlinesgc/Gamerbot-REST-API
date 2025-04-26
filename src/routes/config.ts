import { Request, Response, Router, json } from "express";
import { fetchConfig } from "../models/config_schema";

const configRouter = Router();
configRouter.use(json());

//GET /api/config/:configid
//Returns the configuration data for the given configid
configRouter.get("/:configid", async (req: Request, res: Response) => {
  const configData = await fetchConfig(req.params["configid"]);
  if (configData == null)
    return res.status(400).json({ error: "No data with that ID" });

  res.json(configData?.toJSON());
});

//POST /api/config/:configid
//Updates the configuration data for the given configid
configRouter.post("/:configid", async (req: Request, res: Response) => {
  const jsonBody = req.body;
  const configData = await fetchConfig(req.params["configid"]);
  for (const key in jsonBody) {
    if (configData?.get(key) == null)
      return res
        .status(400)
        .json({ error: `no ${key} key was found in the config` });
    configData.set(key, jsonBody[key]);
  }
  res.json({ message: "Updated config" });
  configData?.save();
});

export { configRouter };
