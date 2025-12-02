import { Request, Response, Router, json } from "express";
import { fetchConfig, updateConfig } from "../models/configSchema";

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

    const updatedConfig = await updateConfig(req.params["configid"], jsonBody);

    if (!updatedConfig) {
        return res.status(400).json({ error: "Failed to update config" });
    }

    res.json(updatedConfig.toJSON());
});

export { configRouter };
