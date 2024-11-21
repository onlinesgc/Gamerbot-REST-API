import { NextFunction, Request, Response, Router } from "express";
import { fetchTokenProfileByToken } from "../models/token_schema";
import { config_router } from "./config";
import { guild_router } from "./guild";
import { user_router } from "./user";

const apiRouter = Router();

interface keyRequest extends Request {
  key?: string;
}

apiRouter.use(async (req: keyRequest, res: Response, next: NextFunction) => {
  const headers = req.headers["authorization"];
  if (!headers) return res.status(401).json({ error: "No API token" });

  const key = headers.split(" ")[1];
  if ((await fetchTokenProfileByToken(key)) == null)
    return res.status(401).json({ error: "Invalid API token" });

  req.key = key;
  next();
});

apiRouter.use("/config", config_router);
apiRouter.use("/guild", guild_router);
apiRouter.use("/user", user_router);

export default apiRouter;
