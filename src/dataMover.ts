/* eslint-disable @typescript-eslint/naming-convention */
import fs from "fs";
import { createUser } from "./models/userSchema";
import path from "path";

interface oldDataFormat {
    xp: number;
    userID: string;
    serverID: string;
    lastMessageTimestamp: number | null;
    xpTimeoutUntil: number | null;
    level: number | null;
    colorHexCode: string | null;
    reminders: [] | null;
    profileFrame: string | null;
    exclusiveFrames: [] | null;
    xpboost: object | null;
    other: object | null;
    privateVoiceID: string | null;
    privateVoiceThreadID: string | null;
    modLogs: [] | null;
    discordAuthToken: string | null;
    saveToken: string | null;
    hasGotMessage: boolean | null;
    loveMessage: boolean | null;
    hasCheckedInSverok: boolean | null;
    paryBotBeta: boolean | null;
    paryBotBetaKey: string | null;
    minecraftWhiteList: boolean | null;
    codeCount: number | null;
    votedResult: string | null;
    old_messages: [] | null;
    extraObjects: object | null;
    hashed_email: string | null;
    minecraftWhiteListConfirm: boolean | null;
    minecraftSecretCode: string | null;
    minecraftUsername: string | null;
    minecraftUuid: string | null;
}

export const moveData = () => {
    const oldDataPath = path.resolve("./oldData/xpsystem.profilemodels.json");
    const rawOldData = fs.readFileSync(oldDataPath, "utf-8");
    const oldData = JSON.parse(rawOldData) as oldDataFormat[];
    let count = 0;
    oldData.forEach(async (oldUser) => {
        count++;
        console.log(`Processing user ${count}/${oldData.length}`);
        const userData = await createUser(oldUser.userID);
        if (!userData) return;
        console.log(`Migrating data for userID: ${oldUser.userID}`);
        userData.levelSystem.xp = oldUser.xp || 0;
        userData.levelSystem.level = oldUser.level || 0;
        userData.levelSystem.lastMessageTimestamp =
            oldUser.lastMessageTimestamp || Date.now();
        userData.levelSystem.xpTimeoutUntil =
            oldUser.xpTimeoutUntil || Date.now();

        userData.frameData.frameColorHexCode =
            oldUser.colorHexCode || "#787C75";
        userData.frameData.selectedFrame = oldUser.profileFrame
            ? parseInt(oldUser.profileFrame)
            : 0;

        oldUser.exclusiveFrames = oldUser.exclusiveFrames || [];
        userData.frameData.frames =
            oldUser.exclusiveFrames && oldUser.exclusiveFrames.length > 0
                ? userData.frameData.frames.concat(
                      oldUser.exclusiveFrames as string[],
                  )
                : userData.frameData.frames;
        userData.voiceData.voiceChannelId = oldUser.privateVoiceID || null;
        userData.voiceData.voiceChannelThreadId =
            oldUser.privateVoiceThreadID || null;

        if (oldUser.modLogs && oldUser.modLogs.length > 0) {
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            const modLogs = oldUser.modLogs.map((log: any) => {
                const newLog = {
                    type: log.type || "unknown",
                    userId: log.userID || "unknown",
                    username: log.userName || "unknown",
                    reason: log.Reason || "No reason provided",
                    timestamp: new Date(log.date).getTime() || Date.now(),
                    length: log.length || "permanent",
                    authorId: log.authorID || "unknown",
                };
                return newLog;
            });
            userData.modLogs.push(...modLogs);
        }

        userData.minecraftData.uuid = oldUser.minecraftUuid || null;
        userData.minecraftData.username = oldUser.minecraftUsername || null;

        userData.hashedEmail = oldUser.hashed_email || null;

        await userData.save();
    });
};
