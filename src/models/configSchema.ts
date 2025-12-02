import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { toDotNotation } from "../utils/toDoNotation";

const levelSchema = new Schema(
    {
        ids: { type: [String] },
        level: { type: Number },
        message: { type: String },
    },
    { _id: false },
);

const levelSystemSchema = new Schema(
    {
        levelExponent: { type: Number, default: 2 },
        levels: [levelSchema],
    },
    { _id: false },
);

const configSchema = new Schema({
    id: { type: String, required: true, unique: true },
    debug: { type: Boolean, default: false },
    levelSystem: { type: levelSystemSchema, default: () => ({}) },
    debugGuildId: { type: String },
    extraObjects: {
        type: Map,
        of: Schema.Types.Mixed,
        default: () => new Map(),
    },
});

export const configModel = model("Config", configSchema);

export type Config = InferSchemaType<typeof configSchema>;
export type ConfigDocument = HydratedDocument<Config>;

/**
 * Fetches the config from the database.
 * If the config does not exist, it creates a new config.
 * @param id - The ID of the config to fetch.
 * @returns The config object.
 */
export const fetchConfig = async (id: string) => {
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
export const createConfig = async (id: string) => {
    const config = await configModel.create({ id: id });
    return config;
};

/**
 * Updates a config in the database using partial data.
 * Uses dot notation to ensure nested fields are updated without overwriting siblings.
 * @param id - The ID of the config to update.
 * @param update - The partial config object containing fields to change.
 * @returns The updated config object.
 */
export const updateConfig = async (id: string, update: Partial<Config>) => {
    const dotNotationUpdate = toDotNotation(update);

    const config = await configModel.findOneAndUpdate(
        { id: id },
        { $set: dotNotationUpdate },
        { new: true },
    );
    return config;
};
