import { Schema, model } from "mongoose";

const tokenProfileSchema = new Schema({
  token: { type: String, require: true, unique: true },
  usage: { type: String, require: true },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  token_id: { type: Number, unique: true, require: true },
});

const tokenModel = model("tokenModel", tokenProfileSchema);

export const fetchTokenProfile = async (id: number) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const tokenData = await tokenModel.findOne({ token_id: { $eq: id } });
  if (!tokenData) return null;
  else return tokenData;
};

export const fetchTokenProfileByToken = async (token: string) => {
  const tokenData = await tokenModel.findOne({ token: { $eq: token } });
  if (!tokenData) return null;
  else return tokenData;
};
