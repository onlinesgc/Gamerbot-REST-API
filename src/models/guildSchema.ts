import { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";
import { toDotNotation } from "../utils/toDoNotation";

const voiceChannelDataSchema = new Schema(
    {
        voiceChannelId: { type: String, default: null },
        infoChatId: { type: String, default: null },
    },
    { _id: false },
);

const ticketDataSchema = new Schema(
    {
        ticketCategoryId: { type: String, default: null },
        archivedTicketCategoryId: { type: String, default: null },
    },
    { _id: false },
);

const autoModerationSchema = new Schema(
    {
        linkFilter: { type: Boolean, default: false },
        trustedLinkRoles: { type: [String] },
        linkChannels: { type: [String] },
        whitelistedLinks: { type: [String] },
        bannedUsers: { type: [Object] },
        modLogChannelId: { type: String },
    },
    { _id: false },
);

const frameSchema = new Schema(
    {
        name: { type: String },
        path: { type: String },
        id: { type: Number },
        foregroundPath: { type: String },
    },
    { _id: false },
);

const guildConfigSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    voiceChannelData: { type: voiceChannelDataSchema, default: () => ({}) },
    ticketData: { type: ticketDataSchema, default: () => ({}) },
    autoModeration: { type: autoModerationSchema, default: () => ({}) },
    topics: { type: [String] },
    noXpChannels: { type: [String], default: [] },
    frames: { type: [frameSchema], default: [] },
    extraObjects: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {},
    },
});

export const guildModel = model("GuildConfig", guildConfigSchema);

export type GuildConfig = InferSchemaType<typeof guildConfigSchema>;
export type GuildConfigDocument = HydratedDocument<GuildConfig>;

/**
 * fetches a guild config from the database.
 * If the guild config does not exist, it creates a new guild config.
 * @param guildId - The ID of the guild to fetch.
 * @returns The guild config object.
 */
export const fetchGuildConfig = async (guildId: string) => {
    if (!guildId || typeof guildId !== "string") return null;
    const guildConfig = await guildModel.findOne({ guildId: guildId });
    if (!guildConfig) return createGuildConfig(guildId);
    return guildConfig;
};

/**
 * Creates a new guild config in the database.
 * @param guildId - The ID of the guild to create.
 * @returns The created guild config object.
 * */
export const createGuildConfig = async (guildId: string) => {
    if (!guildId || typeof guildId !== "string") return null;
    const guildConfig = await guildModel.create({ guildId: guildId });
    return guildConfig;
};

/**
 * Updates a guild config in the database.
 * Uses dot notation to ensure nested fields are updated without overwriting siblings.
 * @param id - The ID of the config to update.
 * @param update - The partial config object containing fields to change.
 * @returns The updated config object.
 */
export const updateGuildConfig = async (
    id: string,
    update: Partial<GuildConfig>,
) => {
    const dotNotationUpdate = toDotNotation(update);

    const guildConfig = await guildModel.findOneAndUpdate(
        { guildId: id },
        { $set: dotNotationUpdate },
        { new: true },
    );
    return guildConfig;
};
