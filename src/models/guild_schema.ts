import { Schema, model } from "mongoose";

const guildConfigSchema = new Schema({
  guildId: { type: String, require: true, unique: true },
  voiceChannelData: {
    voiceChannelId: { type: String },
    infoChatId: { type: String },
  },
  ticketData: {
    ticketCategoryId: { type: String },
    archivedTicketCategoryId: { type: String },
  },
  autoModeration: {
    linkFilter: { type: Boolean, default: false },
    trustedLinkRoles: { type: Array<string> },
    linkChannels: { type: Array<string> },
    whitelistedLinks: { type: Array<string> },
    banedUsers: { type: Array<object> },
    modLogChannelId: { type: String },
  },
  topics: { type: Array<string> },
  noXpChannels: { type: Array, default: [] },
  frames: [
    {
      name: { type: String },
      path: { type: String },
      id: { type: Number },
    },
  ],
  extraObjects: {
    type: Map,
    of: Object,
  },
});

const guildModel = model("GuildConfig", guildConfigSchema);

/**
 * fetches a guild config from the database.
 * If the guild config does not exist, it creates a new guild config.
 * @param guildId - The ID of the guild to fetch.
 * @returns The guild config object.
 */
const fetchGuildConfig = async (guildId: string) => {
  if (!guildId) return null;
  const guildConfig = await guildModel.findOne({ guildId: guildId });
  if (!guildConfig) return createGuildConfig(guildId);
  return guildConfig;
};

/**
 * Creates a new guild config in the database.
 * @param guildId - The ID of the guild to create.
 * @returns The created guild config object.
 * */
const createGuildConfig = async (guildId: string) => {
  const guildConfig = await guildModel.create({ guildId: guildId });
  return guildConfig;
};

export { guildModel, fetchGuildConfig, createGuildConfig };
