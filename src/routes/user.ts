import { Request, Response, Router, json } from "express";
import { fetchAllUsers, fetchUser } from "../models/user_schema";

const userRouter = Router();
userRouter.use(json());

//GET /api/user/:userid
//Returns the user data for the given userid
userRouter.get("/:userid", async (req: Request, res: Response) => {
  const guildData = await fetchUser(req.params["userid"]);

  if (!guildData) return res.status(400).json({ error: "No guild data" });

  return res.json(await filterModelJson(guildData.toJSON()));
});

//POST /api/user/fetch_many
//Returns the user data for the given filter
userRouter.post("/fetch_many", async (req: Request, res: Response) => {
  const jsonBody = req.body;

  if (jsonBody.filter == null)
    return res.status(400).json({ error: "No filter key in body" });

  const users =
    jsonBody.maxUsers == null
      ? await fetchAllUsers(jsonBody.filter)
      : await fetchAllUsers(jsonBody.filter, jsonBody.maxUsers);

  res.json(
    await Promise.all(users.map((user) => filterModelJson(user.toJSON()))),
  );
});

//POST /api/user/:userid
//Updates the user data for the given userid
userRouter.post("/:userid", async (req: Request, res: Response) => {
  const jsonBody = req.body;

  const userData = await fetchUser(req.params["userid"]);

  if (jsonBody == null)
    return res.status(400).json({ error: "No body key in body" });

  if (!updateUserData(userData, jsonBody))
    return res.status(400).json({ error: "Invalid key in body" });

  res.json({ message: "Updated user data" });
});

const filterModelJson = async (json: object) => {
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
const updateUserData = async (userData: any, jsonBody: any) => {
  //update given keys.
  for (const key in jsonBody) {
    if (userData?.get(key) == null) return false;
    if (key.startsWith("_")) continue;
    userData.set(key, jsonBody[key]);
  }
  await userData.save();
  return true;
};

export { userRouter };
