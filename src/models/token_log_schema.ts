import { Schema, model } from "mongoose";
import { fetchTokenProfileByToken } from "./token_schema";

const tokenLogProfileSchema = new Schema({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  token_id: { type: Number, require: true },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  request_type: { type: String, require: true },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  request_timestamp: { type: Date, require: true },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  request_data: { type: Object, require: true },
});

const tokenLogModel = model("tokenLogModel", tokenLogProfileSchema);

export const fetchTokenLogProfile = async (id: string) => {
  const tokenLogData = await tokenLogModel.findOne({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_id: { $eq: id },
  });
  if (!tokenLogData) return null;
  else return tokenLogData;
};

export const createTokenLog = async (
  tokenHeaders: string,
  requestType: string,
  requestTimestamp: Date,
  requestData: object,
) => {
  const key = tokenHeaders.split(" ")[1];
  return await _createTokenLog(
    (await fetchTokenProfileByToken(key))?.token_id as number,
    requestType,
    requestTimestamp,
    requestData,
  );
};

const _createTokenLog = async (
  tokenId: number,
  requestType: string,
  requestTimestamp: Date,
  requestData: object,
) => {
  //Log system is off until further investigation in how to make it work with a bot that spams requests
  return;
  const tokenLogData = await tokenLogModel.create({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_id: tokenId,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    request_type: requestType,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    request_timestamp: requestTimestamp,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    request_data: requestData,
  });
  return tokenLogData;
};
