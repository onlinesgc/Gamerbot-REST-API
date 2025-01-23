import { Schema, model, sanitizeFilter } from "mongoose";

const userSchema = new Schema({
  userID: { type: String, require: true, unique: true },
  serverID: { type: String, require: true },
  xp: { type: Number, default: 0 },
  lastMessageTimestamp: { type: Number },
  xpTimeoutUntil: { type: Number },
  level: { type: Number },
  reminders: { type: Array },
  colorHexCode: { type: String },
  privateVoiceID: { type: String, default: "" },
  privateVoiceThreadID: { type: String, default: "" },
  profileFrame: { type: String },
  hasLeftTicket: { type: Boolean },
  xpboost: {
    type: Object,
    default: {
      multiplier: 1,
      stopBoostTimestamp: null,
    },
  },
  exclusiveFrames: { type: Array },
  other: {
    type: Object,
    default: {
      hasHallowenFrame: false,
    },
  },
  modLogs: { type: Array },
  hasCheckedInSverok: { type: Boolean, default: false },
  // Parkour WhiteList
  minecraftWhiteList: { type: Boolean, default: false },
  minecraftUsername: { type: String },
  minecraftUuid: { type: String },
  minecraftSecretCode: { type: String },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  old_messages: { type: Array },
  cachedImageLink: { type: String },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hashed_email: { type: String },
  extraObjects: { type: Map, default: {} },
});

const userModel = model("ProfileModels", userSchema);

export const fetchUser = async (userId: string) => {
  if (!userId) return null;
  const profileData = await userModel.findOne({ userID: { $eq: userId } });
  if (!profileData) return null;
  if (profileData.hashed_email == undefined) profileData.hashed_email = "";
  return profileData;
};

export const createUser = async (
  userId: string,
  serverId: string,
  lastMessageTimestamp = 0,
  xpTimeoutUntil = 0,
  colorHexCode = "#787C75",
  profileFrame = 0,
) => {
  const profileData = await userModel.create({
    userId,
    serverId,
    xp: 0,
    lastMessageTimestamp,
    xpTimeoutUntil,
    level: 1,
    reminders: [],
    colorHexCode,
    profileFrame,
    exclusiveFrames: [],
    minecraftUsername: null,
    minecraftUuid: null,
    minecraftSecretCode: null,
  });
  await profileData.save();
  return profileData;
};

export const fetchAll = async (filter: object, maxUsers = -1) => {
  filter = sanitizeFilter(filter) || {};

  const profiles =
    maxUsers != -1
      ? userModel
          .find(filter)
          .sort({ level: -1 })
          .sort({ xp: -1 })
          .limit(maxUsers)
      : userModel.find(filter).sort({ level: -1 }).sort({ xp: -1 });
  return profiles;
};
