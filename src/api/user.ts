import { Request, Response, Router, json } from "express";
import { createTokenLog } from "../models/token_log_schema";
import { createUser, fetchAll, fetchUser } from "../models/user_schema";

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
  //fetch user data
  let guild_data = await fetchUser(req.params["userid"]);

  //if user data is not found, create a new one
  if (!guild_data) {
    guild_data = await createUser(
      req.params["userid"],
      "516605157795037185",
      Date.now(),
      Date.now() + 10 * 60 * 1000,
    );
  }

  if (!guild_data) return res.status(400).json({ error: "No guild data" });

  return res.json(await filter_model_json(guild_data.toJSON()));
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

  res.json(
    await Promise.all(users.map((user) => filter_model_json(user.toJSON()))),
  );
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

  const user_data = await fetchUser(req.params["userid"]);

  if (!user_data) return res.status(400).json({ error: "No user data" });

  if (json_body == null)
    return res.status(400).json({ error: "No body key in body" });

  if (!update_user_data(user_data, json_body))
    return res.status(400).json({ error: "Invalid key in body" });

  res.json({ message: "Updated user data" });
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
  const user_data = await fetchUser(req.params["userid"]);

  if (!user_data) return res.status(400).json({ error: "No user data" });

  if (json_body.value == null || json_body.key == null)
    return res.status(400).json({ error: "No value key in body" });

  user_data.extraObjects.set(json_body.key, json_body.value);
  await user_data.save();
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
    const user_data = await fetchUser(req.params["userid"]);

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
  const guild_data = await fetchUser(json_body.userID);
  if (guild_data != null)
    return res.status(400).json({ error: "User already exists" });

  if (
    json_body.userID == null ||
    json_body.serverID == null ||
    json_body.lastMessageTimestamp == null ||
    json_body.xpTimeoutUntil == null
  )
    return res.status(400).json({ error: "Missing parameters" });

  const new_user_data = await createUser(
    json_body.userID,
    json_body.serverID,
    json_body.lastMessageTimestamp,
    json_body.xpTimeoutUntil,
  );
  res.json(new_user_data?.toJSON());
});

//eslint-disable-next-line
const filter_model_json = async (json: any) => {
  const jsonData = {};
  await Promise.all(
    Object.entries(json).map(async ([key, value]) => {
      //eslint-disable-next-line
      if (!key.startsWith("_")) (jsonData as any)[key] = value;
    }),
  );
  return jsonData;
};
//eslint-disable-next-line
const update_user_data = async (user_data: any, json_body: any) => {
  //update given keys.
  for (const key in json_body) {
    if (user_data?.get(key) == null) return false;
    if (key.startsWith("_")) continue;
    user_data.set(key, json_body[key]);
  }
  await user_data.save().catch(async () => {
    user_data = await fetchUser(user_data.userID);
    await update_user_data(user_data, json_body);
  });
  return true;
};

export { user_router };
