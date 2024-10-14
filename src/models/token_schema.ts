import { Schema, model } from "mongoose";

const token_profile_schema = new Schema({
    token: { type: String, require: true, unique: true },
    usage: { type: String, require: true },
    token_id: { type: Number, unique: true, require: true },
});

const token_model = model("tokenModel", token_profile_schema);

/**
 * fetch token
 * @param id token id
 * @returns token profile
 */
export const fetchTokenProfile = async (id: number) => {
    const tokenData = await token_model.findOne({ token_id: { $eq: id } });
    if (!tokenData) return null;
    else return tokenData;
};

/**
 * fetch profile
 * @param token token
 * @returns token profile
 */
export const fetchTokenProfileByToken = async (token: string) => {
    const tokenData = await token_model.findOne({ token: { $eq: token } });
    if (!tokenData) return null;
    else return tokenData;
};
