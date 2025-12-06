import {
    HydratedDocument,
    InferSchemaType,
    Schema,
    model,
    sanitizeFilter,
} from "mongoose";
import { toDotNotation } from "../utils/toDoNotation";

const levelSystemSchema = new Schema(
    {
        level: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
        xpTimeoutUntil: { type: Number },
        lastMessageTimestamp: { type: Number },
        oldMessages: { type: [String] },
    },
    { _id: false },
);

const frameDataSchema = new Schema(
    {
        frameColorHexCode: { type: String, default: "#787C75" },
        selectedFrame: { type: Number, default: 0 },
        frames: {
            type: [String],
            default: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        },
    },
    { _id: false },
);

const voiceDataSchema = new Schema(
    {
        voiceChannelId: { type: String },
        voiceChannelThreadId: { type: String },
    },
    { _id: false },
);

const minecraftDataSchema = new Schema(
    {
        uuid: { type: String },
        username: { type: String },
    },
    { _id: false },
);

const modLogSchema = new Schema(
    {
        type: { type: String },
        userId: { type: String },
        username: { type: String },
        reason: { type: String },
        timestamp: { type: Number },
        length: { type: String },
        authorId: { type: String },
    },
    { _id: false },
);

const remiderSchema = new Schema(
    {
        timestamp: { type: Number },
        message: { type: String },
        userId: { type: String },
    },
    { _id: false },
);

const userSchema = new Schema({
    userId: { type: String, require: true, unique: true },
    levelSystem: {
        type: levelSystemSchema,
        default: () => ({
            level: 0,
            xp: 0,
            xpTimeoutUntil: Date.now(),
            lastMessageTimestamp: Date.now(),
            oldMessages: [],
        }),
    },
    frameData: {
        type: frameDataSchema,
        default: () => ({
            frameColorHexCode: "#787C75",
            selectedFrame: 0,
            frames: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        }),
    },
    voiceData: {
        type: voiceDataSchema,
        default: () => ({}),
    },
    modLogs: { type: [modLogSchema], default: [] },
    minecraftData: { type: minecraftDataSchema, default: () => ({}) },
    hashedEmail: { type: String },
    reminders: { type: [remiderSchema], default: [] },
    extraObjects: {
        type: Map,
        of: Schema.Types.Mixed,
        default: new Map(),
    },
});

export const userModel = model("Users", userSchema);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

/**
 * Fetches a user from the database.
 * If the user does not exist, it creates a new user.
 * @param userId - The ID of the user to fetch.
 * @returns The user object.
 */
export const fetchUser = async (userId: string, createOnFail = true) => {
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
export const createUser = async (userId: string) => {
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
export const fetchAllUsers = async (filter: object, maxUser = -1) => {
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

export const fetchAllUsersWithoutSanitized = async (filter: object) => {
    return await userModel.find(filter);
};

/**
 * Updates a user in the database.
 * Uses dot notation to ensure nested fields are updated without overwriting siblings.
 * @param id - The ID of the user to update.
 * @param update - The partial user object containing fields to change.
 * @returns The updated user object.
 */
export const updateUser = async (id: string, update: Partial<User>) => {
    const dotNotationUpdate = toDotNotation(update);

    const user = await userModel.findOneAndUpdate(
        { userId: id },
        { $set: dotNotationUpdate },
        { new: true },
    );
    return user;
};
