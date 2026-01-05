import { getProfileFromUsername, uuidToFullUuid } from "minecraft-api-wrapper";
import { UserDocument } from "../models/userSchema";

export async function formatUsersToWhitelist(users: UserDocument[]) {
    const minecraftUsers = await Promise.all(
        users.map(async (user) => {
            if (user.minecraftData.uuid == null) {
                const profile = await getProfileFromUsername(
                    user.minecraftData.username!,
                );
                if (profile) {
                    user.minecraftData.uuid = profile.getFullUUID();
                    await user.save();
                }
            }
            return user;
        }),
    );

    for (const user of users) {
        if (user.minecraftData.uuid == null) {
            user.minecraftData.username = null;
            user.minecraftData.uuid = null;
            minecraftUsers.splice(minecraftUsers.indexOf(user), 1);
            await user.save();
            continue;
        }
        if (!user.minecraftData.uuid?.includes("-")) {
            user.minecraftData.uuid = uuidToFullUuid(user.minecraftData.uuid!);
        }
    }

    return minecraftUsers.map((user) => ({
        name: user.minecraftData.username!,
        uuid: user.minecraftData.uuid!,
        discordId: user.userId,
    }));
}
