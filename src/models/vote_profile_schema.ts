import { Schema, model } from "mongoose";

const vote_profile_schema = new Schema({
    userID: { type: String, require: true, unique: true },
    hasVoted: { type: Boolean, default: false },
    hasMobVoted: { type: Boolean, default: false },
    voted: { type: String },
    mobvote: { type: String },
});

const vote_model = model("voteProfileModuel", vote_profile_schema);

/**
 * fetch vote profile
 * @param user_ID user id
 * @returns vote profile
 */
export const fetchVoteProfile = async (user_ID: string) => {
    let voteProfileData = await vote_model.findOne({ userID: user_ID });
    if (!voteProfileData) {
        voteProfileData = await vote_model.create({
            userID: user_ID,
        });
        await voteProfileData.save();
    }
    return voteProfileData;
};
