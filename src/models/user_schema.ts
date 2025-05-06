import { Schema, model, sanitizeFilter } from "mongoose";

const userSchema = new Schema({
  userId: { type: String, require: true, unique: true },
  levelSystem: {
    level: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    xpTimeoutUntil: { type: Number },
    lastMessageTimestamp: { type: Number },
    oldMessages: { type: Array<string> },
  },
  frameData: {
    frameColorHexCode: { type: String, default: "#787C75" },
    selectedFrame: { type: Number, default: 0 },
    frames: {
      type: Array<string>,
      default: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    },
  },
  voiceData: {
    voiceChannelId: { type: String },
    voiceChannelThreadId: { type: String },
  },
  modLogs: {
    type: Array<object>,
  },
  minecraftData: {
    uuid: { type: String },
    username: { type: String },
  },
  extraObjects: {
    type: Map<string, object>,
  },
  hashedEmail: { type: String },
  reminders: { type: Array<object> },
});

const userModel = model("Users", userSchema);

/**
 * Fetches a user from the database.
 * If the user does not exist, it creates a new user.
 * @param userId - The ID of the user to fetch.
 * @returns The user object.
 */
const fetchUser = async (userId: string, createOnFail = true) => {
  if (!userId) return null;
  const user = await userModel.findOne({ userId: userId });
  if (!user && createOnFail) return createUser(userId);
  if (!user) return null;
  return user;
};

/**
 * Creates a new user in the database.
 * @param userId - The ID of the user to create.
 * @returns The created user object.
 */
const createUser = async (userId: string) => {
  const user = await userModel.create({ userId: userId });
  user.levelSystem!.lastMessageTimestamp = Date.now();
  user.levelSystem!.xpTimeoutUntil = Date.now();
  await user.save();
  return user;
};

/**
 * Fetches all users from the database.
 * @param filter - The filter to apply to the query.
 * @param maxUser - The maximum number of users to fetch. Default is -1 (no limit).
 * @returns An array of user objects.
 */
const fetchAllUsers = async (filter: object, maxUser = -1) => {
  const sanitizedFilter = sanitizeFilter(filter) || {};
  if (maxUser == -1) {
    return await userModel
      .find(sanitizedFilter)
      .sort({ ["levelSystem.level"]: -1 })
      .sort({ ["levelSystem.xp"]: -1 });
  } else {
    return await userModel
      .find(sanitizedFilter)
      .sort({ ["levelSystem.level"]: -1 })
      .sort({ ["levelSystem.xp"]: -1 })
      .limit(maxUser);
  }
};

export { userModel, fetchUser, createUser, fetchAllUsers };
