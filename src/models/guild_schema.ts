import { Schema, model } from "mongoose";

const guild_config_schema = new Schema({
    guildID: { type: String, require: true, unique: true },
    privateVoiceChannel: { type: String, default: "" },
    publicVoiceChannel: { type: String, default: "" },
    infoVoiceChannel: { type: String, default: "" },
    notificationChannel: { type: String, default: "" },
    ticketParent: { type: String, default: "" },
    archivedTicketParent: { type: String, default: "" },
    allowedLinksChannels: { type: Array, default: [] },
    trustedLinkRoles: { type: Array, default: [] },
    xpBoostRoles: { type: Array, default: [] },
    noXpChannels: { type: Array, default: [] },
    whitelistedLinks: { type: Array, default: [] },
    threedChannels: { type: Array, default: [] },
    bansTimes: { type: Array },
    topicList: { type: Array },
    staffModlogs: { type: String },
    sverokMails: { type: Array },
    frameConfig: {
        type: Array<object>,
        default: [
            {
                name: "Default",
                frameLink: "",
                path: "",
                id: 0,
            },
        ],
    },
    extraObjects: { type: Map, default: {} },
});

const guild_model = model("GuildConfig", guild_config_schema);

/**
 * Fetch guild config
 * @param guild_ID guild id
 * @returns
 */
const fetch_guild_config = async (guild_ID: string) => {
    const data = await guild_model.findOne({ guildID: { $eq: guild_ID } });
    if (data == null) return null;
    return data;
};
/**
 * create guild config
 * @param guild_ID guild id
 */
const create_guild_config = async (guild_ID: string) => {
    const data = await guild_model.create({
        guildID: guild_ID,
    });
    await data.save();
    return data;
};

export { guild_model, fetch_guild_config, create_guild_config };
