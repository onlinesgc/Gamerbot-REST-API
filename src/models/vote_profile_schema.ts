import { Schema, model } from "mongoose";

const voteProfileSchema = new Schema({
  userID: { type: String, require: true, unique: true },
  hasVoted: { type: Boolean, default: false },
  hasMobVoted: { type: Boolean, default: false },
  voted: { type: String },
  mobvote: { type: String },
});

const voteModel = model("voteProfileModuel", voteProfileSchema);

export const fetchVoteProfile = async (userId: string) => {
  let voteProfileData = await voteModel.findOne({ userID: userId });
  if (!voteProfileData) {
    voteProfileData = await voteModel.create({
      userID: userId,
    });
    await voteProfileData.save();
  }
  return voteProfileData;
};
