import { Schema, model } from "mongoose";
import { fetchTokenProfileByToken } from "./token_schema";

const token_log_profile_schema = new Schema({
  token_id: { type: Number, require: true },
  request_type: { type: String, require: true },
  request_timestamp: { type: Date, require: true },
  request_data: { type: Object, require: true },
});

const token_log_model = model("tokenLogModel", token_log_profile_schema);

/**
 * fetch token
 * @param id user id
 * @returns token profile
 */
export const fetchTokenLogProfile = async (id: string) => {
  const tokenLogData = await token_log_model.findOne({
    token_id: { $eq: id },
  });
  if (!tokenLogData) return null;
  else return tokenLogData;
};
/**
 * create token log
 * @param token
 * @param request_type
 * @param request_timestamp
 * @param request_data
 * @returns token log data
 */
export const createTokenLog = async (
  token_headers: string,
  request_type: string,
  request_timestamp: Date,
  request_data: object
) => {
  const key = token_headers.split(" ")[1];
  return await _createTokenLog(
    (await fetchTokenProfileByToken(key))?.token_id as number,
    request_type,
    request_timestamp,
    request_data
  );
};
const _createTokenLog = async (
  token_id: number,
  request_type: string,
  request_timestamp: Date,
  request_data: object
) => {
  //Log system is off until further investigation in how to make it work with a bot that spams requests
  return;
  const tokenLogData = await token_log_model.create({
    token_id: token_id,
    request_type: request_type,
    request_timestamp: request_timestamp,
    request_data: request_data,
  });
  return tokenLogData;
};
