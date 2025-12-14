import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import apiRouter from "./routes";
import KeyRequest from "./interfaces/KeyRequest";
import { startMongoConnection } from "./models/startup";
import { fetchTokenProfileByToken } from "./models/tokenSchema";
import { publicFrameRouter } from "./public_api/frame";
import { publicUserRouter } from "./public_api/user";
import cors from "cors";
import logger from "./utils/logger";

//Create express app
const app = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
    logger.silly(req.originalUrl);
    next();
});

app.use(cors());

//Rate limiter for the API. Max 100 requests per 15 minutes. If the token is valid, the rate limit is not applied.
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        skip: async (req: KeyRequest) =>
            (await fetchTokenProfileByToken(
                req.headers["authorization"]?.split(" ")[1] as string,
            )) != null, //skip if the token is valid, otherwise apply rate limit.
    }),
);

app.use("/api", apiRouter);

//public api
app.use("/public_api/user", publicUserRouter);
app.use("/public_api/frame", publicFrameRouter);

//root endpoint
app.get("/", (req: Request, res: Response) => {
    res.json({ service: "OK" });
});

app.listen(port, async () => {
    if (process.env.DEBUG === "true") {
        logger.level = "debug";
    }
    await startMongoConnection();
    logger.info(`Listening on port ${port}`);
});
