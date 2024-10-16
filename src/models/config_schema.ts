import { Schema, model } from 'mongoose'

const configSchema = new Schema({
    id: { type: Number, default: 0 },
    debug: { type: Boolean, default: false },
    debugGuildID: { type: String },
    username: { type: String },
    activity: { type: String },
    activityType: { type: String },
    removeLinks: { type: Boolean, default: false },
    NotisSystemOn: { type: Boolean, default: false },
    notifcationReloadTime: { type: Number },
    cacheQueue: { type: Array<string> },
    NotisChannels: {
        type: Array,
        default: {
            // Channels where stream/video-notifications are sent
            id: 'UCOZr_fd45CDuyqQEPQZaqMA',
            Notis: true,
        },
    },
    xp: {
        type: Object,
        default: {
            timeoutsEnabled: { type: Boolean, default: true },
            xpHidden: true,
            xpTimeoutHidden: true,
            levelExponent: 2,
            levelBaseOffset: 0,
            levels: [],
        },
    },
    importantUpdatesChannelId: {
        // Channel to send updates when a member
        type: String, // level up to level 20 or
        required: false, // leave the server with a specific role
        default: '',
    },
    extraObjects: { type: Map, default: {} },
})

export const configModel = model('ConfigModel', configSchema)

/**
 * gets the config data
 * @param id id of the config you want to fetch
 * @returns
 */
export const fetch_config = async (id: string) => {
    const configData = await configModel.findOne({ id: { $eq: id } })
    if (!configData) return await create_config(id)
    return configData
}
/**
 * creates a new config
 * @param id config id
 */
export const create_config = async (id: string) => {
    const configData = await configModel.create({
        id: id,
        username: 'GamerBot3.0',
        activity: 'Testspel',
        activityType: 'playing',
    })
    await configData.save()
    return configData
}
