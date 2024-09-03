import {Schema, model} from "mongoose";

const user_schema = new Schema({
    userID: { type: String, require: true, unique: true},
    serverID: { type: String, require: true },
    xp: { type: Number, default: 0 },
    lastMessageTimestamp: { type: Number },
    xpTimeoutUntil: { type: Number },
    level: { type: Number },
    reminders: { type: Array },
    colorHexCode: { type: String },
	privateVoiceID: { type: String, default: "" },
	privateVoiceThreadID: { type: String, default: "" },
    profileFrame: {type: String},
	hasLeftTicket: {type: Boolean},
    xpboost: { type: Object, default: {
	    multiplier: 1,
	    stopBoostTimestamp: null}},
    exclusiveFrames: {type: Array},
	other: {type: Object, default:{
		hasHallowenFrame: false
	}},
	modLogs:{type: Array},
	hasCheckedInSverok:{type:Boolean , default:false},
	// Parkour WhiteList
	minecraftWhiteList:{type:Boolean , default:false},
	minecraftUsername:{type:String},
	minecraftUuid:{type:String},
	minecraftSecretCode:{type:String},
	old_messages:{type:Array},
	cachedImageLink:{type:String},
	extraObjects: {type: Map, default: {}}
});

const user_model = model("ProfileModels", user_schema);

/**
 * Fetch user
 * @param user_ID user id
 * @returns user profile
 */
const fetch_user = async (user_ID : String) => {
	let profileData = await user_model.findOne({ userID: user_ID });
	if (!profileData) 
		return null;
	return profileData;
};

/**
 * Create user
 * @param user_ID 
 * @param server_ID 
 * @param last_message_timestamp 
 * @param xp_timeout_until 
 * @param color_hex_code 
 * @param profile_frame 
 */
const create_user = async (user_ID : String, server_ID:String, last_message_timestamp:any = null, xp_timeout_until:any = null, color_hex_code = "#787C75", profile_frame = 0) => {
	let profileData = await user_model.create({
		userID: user_ID,
		serverID: server_ID,
		xp: 0,
		lastMessageTimestamp: last_message_timestamp,
		xpTimeoutUntil: xp_timeout_until,
		level: 1,
		reminders: [],
		colorHexCode: color_hex_code,
		profileFrame : profile_frame,
		exclusiveFrames: [],
		minecraftUsername: null,
		minecraftUuid: null,
		minecraftSecretCode: null
	});
	await profileData.save();
	return profileData;
}
/**
 * fetch all users with filter
 * @param filter 
 * @param maxUsers 
 * @returns 
 */
const fetchAll = async (filter:any, maxUsers = -1) => {
	filter = filter || {};
	let profiles = (maxUsers != -1) ? user_model.find(filter).sort({level:-1}).sort({xp:-1}).limit(maxUsers) : user_model.find(filter).sort({level:-1}).sort({xp:-1});
	return profiles;
};

export { user_model, fetch_user, create_user, fetchAll}
