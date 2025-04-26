import { NextFunction, Response, Router } from "express";
import KeyRequest from "../interfaces/KeyRequest";
import { fetchTokenProfileByToken } from "../models/token_schema";
import { configRouter } from "./config";
import { guildRouter } from "./guild";
import { userRouter } from "./user";

const apiRouter = Router();

apiRouter.use(async (req: KeyRequest, res: Response, next: NextFunction) => {
  const headers = req.headers["authorization"];
  if (!headers) return res.status(401).json({ error: "No API token" });

  const key = headers.split(" ")[1];
  if ((await fetchTokenProfileByToken(key)) == null)
    return res.status(401).json({ error: "Invalid API token" });

  req.key = key;
  next();
});

apiRouter.use("/config", configRouter);
apiRouter.use("/guild", guildRouter);
apiRouter.use("/user", userRouter);

export default apiRouter;
