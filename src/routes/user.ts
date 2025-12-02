import { Request, Response, Router, json } from "express";
import { fetchAllUsers, fetchUser, updateUser } from "../models/userSchema";

const userRouter = Router();
userRouter.use(json());

//GET /api/user/:userid
//Returns the user data for the given userid
userRouter.get("/:userid", async (req: Request, res: Response) => {
    const guildData = await fetchUser(req.params["userid"]);

    if (!guildData) return res.status(400).json({ error: "No guild data" });

    return res.json(guildData.toJSON());
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

    res.json(await Promise.all(users.map((user) => user.toJSON())));
});

//POST /api/user/:userid
//Updates the user data for the given userid
userRouter.post("/:userid", async (req: Request, res: Response) => {
    const jsonBody = req.body;

    const userData = await updateUser(req.params["userid"], jsonBody);

    if (!userData) {
        return res.status(400).json({ error: "Failed to update user data" });
    }

    res.json(userData.toJSON());
});

export { userRouter };
