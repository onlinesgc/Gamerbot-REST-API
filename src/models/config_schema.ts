import { Schema, model } from "mongoose";

const configSchema = new Schema({
  id: { type: String, require: true, unique: true },
  debug: { type: Boolean, default: false },
  levelSystem: {
    levelExponent: { type: Number, default: 2 },
    levels: [
      {
        ids: { type: Array<string> },
        level: { type: Number },
        message: { type: String },
      },
    ],
  },
  cachedGeneratedFrames: [
    {
      userId: { type: String },
      frameId: { type: Number },
      hexColor: { type: String },
      username: { type: String },
      level: { type: Number },
      xpPercentage: { type: Number },
      memberAvatar: { type: String },
    },
  ],
  debugGuildId: { type: String },
  extraobjects: { type: Map<string, object> },
});

const configModel = model("Config", configSchema);

/**
 * Fetches the config from the database.
 * If the config does not exist, it creates a new config.
 * @param id - The ID of the config to fetch.
 * @returns The config object.
 */
const fetchConfig = async (id: string) => {
  if (!id) return null;
  const config = await configModel.findOne({ id: id });
  if (!config) return createConfig(id);
  return config;
};

/**
 * Creates a new config in the database.
 * @param id - The ID of the config to create.
 * @returns The created config object.
 * */
const createConfig = async (id: string) => {
  const config = await configModel.create({ id: id });
  return config;
};

export { configModel, fetchConfig, createConfig };
