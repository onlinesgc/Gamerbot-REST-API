import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import apiRouter from "./api";
import KeyRequest from "./interfaces/KeyRequest";
import prometheusMiddleware from "./middlewares/prometheus";
import { start_mongo_connection } from "./models/startup";
import { fetchTokenProfileByToken } from "./models/token_schema";
import { public_frame_router } from "./public_api/frame";
import { public_user_router } from "./public_api/user";
import logger from "./utils/logger";

//Create express app
const app = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.silly(req.originalUrl);
  next();
});

app.use(prometheusMiddleware);

//Rate limiter for the API. Max 100 requests per 15 minutes. If the token is valid, the rate limit is not applied.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: async (req: KeyRequest) =>
      (await fetchTokenProfileByToken(
        req.headers["authorization"]?.split(" ")[1] as string
      )) != null, //skip if the token is valid, otherwise apply rate limit to the ta;
  })
);

app.use("/api", apiRouter);

//public api
app.use("/public_api/user", public_user_router);
app.use("/public_api/frame", public_frame_router);

//root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ service: "OK" });
});

app.listen(port, async () => {
  await start_mongo_connection();
  logger.info(`Listening on port ${port}`);
});
