import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { start_mongo_connection } from "./models/startup";
import { config_router } from "./api/config";
import { guild_router } from "./api/guild";
import { user_router } from "./api/user";
import { public_user_router } from "./public_api/user";
import { fetchTokenProfileByToken } from "./models/token_schema";
import { rateLimit } from "express-rate-limit";
import Crypto from "crypto"; 

//setup environment variables
dotenv.config();
const hash = Crypto.createHmac("sha256", process.env.HASH_SECRET as string);


const app: Express = express();
const PORT = process.env.PORT || 3000;

//Interfaces for classes
interface keyRequest extends Request {
  key?: string;
}

//Middleware for API keys
app.use("/api", async (req: keyRequest, res: Response, next: NextFunction) => {
  const headers = req.headers["authorization"];
  if (!headers) return res.status(401).json({ error: "No API token" });

  const key = headers.split(" ")[1];
  if ((await fetchTokenProfileByToken(hash.up)) == null)
    return res.status(401).json({ error: "Invalid API token" });

  req.key = key;
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: async () =>
      (await fetchTokenProfileByToken(
        hash.digest('hex'),
      )) != null, //skip if the token is valid, otherwise apply rate limit to the ta;
  }),
);

//routers
app.use("/api/config", config_router);
app.use("/api/guild", guild_router);
app.use("/api/user", user_router);

//public api
app.use("/public_api/user", public_user_router);

app.get("/", (req: Request, res: Response) => {
  res.json({ service: "OK" });
});

app.listen(PORT, async () => {
  await start_mongo_connection();
  console.log(
    `[server]: Server and datamodel is running at http://localhost:${PORT}`,
  );
});
