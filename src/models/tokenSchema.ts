import { Schema, model } from "mongoose";

const tokenProfileSchema = new Schema({
    token: { type: String, require: true, unique: true },
    usage: { type: String, require: true },
    tokenId: { type: Number, unique: true, require: true },
});

const tokenModel = model("tokenModel", tokenProfileSchema);

export const fetchTokenProfile = async (id: number) => {
    const tokenData = await tokenModel.findOne({ tokenId: { $eq: id } });
    if (!tokenData) return null;
    else return tokenData;
};

export const fetchTokenProfileByToken = async (token: string) => {
    const tokenData = await tokenModel.findOne({ token: { $eq: token } });
    if (!tokenData) return null;
    else return tokenData;
};
