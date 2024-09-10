import { Request, Response, Router, json } from "express";
import { create_user, fetchAll, fetch_user } from "../models/user_schema";
import { createTokenLog } from "../models/token_log_schema";

const user_router = Router();
user_router.use(json());

//GET /api/user/:userid
//Returns the user data for the given userid
user_router.get("/:userid", async (req: Request, res: Response) => {
  createTokenLog(
    req.headers["authorization"] as string,
    "GET /api/user/:userid",
    new Date(),
    { userid: req.params["userid"] },
  );
  const guild_data = await fetch_user(req.params["userid"]);
  if (guild_data == null)
    return res.status(400).json({ error: "No data with that ID" });

  return res.json(guild_data.toJSON());
});

//POST /api/user/fetch_many
//Returns the user data for the given filter
user_router.post("/fetch_many", async (req: Request, res: Response) => {
  const json_body = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/user/fetch_many",
    new Date(),
    { filter: json_body.filter },
  );
  if (json_body.filter == null)
    return res.status(400).json({ error: "No filter key in body" });
  const users =
    json_body.maxUsers == null
      ? await fetchAll(json_body.filter)
      : await fetchAll(json_body.filter, json_body.maxUsers);
  res.json(users);
});

//POST /api/user/:userid
//Updates the user data for the given userid
user_router.post("/:userid", async (req: Request, res: Response) => {
  const json_body = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/user/:userid",
    new Date(),
    { userid: req.params["userid"], body: json_body },
  );
  const user_data = await fetch_user(req.params["userid"]);
  for (const key in json_body) {
    if (user_data?.get(key) == null)
      return res
        .status(400)
        .json({ error: `no ${key} key was found in the user data` });
    user_data.set(key, json_body[key]);
  }
  res.json({ message: "Updated user data" });
  user_data?.save();
});

//POST /api/user/:userid/add_obj
//Adds an object to the extraObjects map in the user data for the given userid
user_router.post("/:userid/add_obj", async (req: Request, res: Response) => {
  const json_body = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/user/:userid/add_obj",
    new Date(),
    { userid: req.params["userid"], body: json_body },
  );
  const user_data = await fetch_user(req.params["userid"]);
  if (json_body.value == null || json_body.key == null)
    return res.status(400).json({ error: "No value key in body" });

  user_data?.extraObjects.set(json_body.key, json_body.value);
  user_data?.save();
  res.json(user_data?.toJSON());
});

//DELETE /api/user/:userid/remove_obj
//Removes an object from the extraObjects map in the user data for the given userid
user_router.delete(
  "/:userid/remove_obj",
  async (req: Request, res: Response) => {
    const json_body = req.body;
    createTokenLog(
      req.headers["authorization"] as string,
      "DELETE /api/user/:userid/remove_obj",
      new Date(),
      { userid: req.params["userid"], body: json_body },
    );
    const user_data = await fetch_user(req.params["userid"]);

    if (json_body.key == null)
      return res.status(400).json({ error: "No key key in guild data" });

    user_data?.extraObjects.delete(json_body.key);
    user_data?.save();
    res.json(user_data?.toJSON());
  },
);

//POST /api/user/create
//Creates a new user
user_router.post("/create", async (req: Request, res: Response) => {
  const json_body = req.body;
  createTokenLog(
    req.headers["authorization"] as string,
    "POST /api/user/create",
    new Date(),
    { body: json_body },
  );
  const guild_data = await fetch_user(json_body.userID);
  if (guild_data != null)
    return res.status(400).json({ error: "User already exists" });

  if (
    json_body.userID == null ||
    json_body.serverID == null ||
    json_body.lastMessageTimestamp == null ||
    json_body.xpTimeoutUntil == null
  )
    return res.status(400).json({ error: "Missing parameters" });

  const new_user_data = await create_user(
    json_body.userID,
    json_body.serverID,
    json_body.lastMessageTimestamp,
    json_body.xpTimeoutUntil,
  );
  res.json(new_user_data?.toJSON());
});

export { user_router };
