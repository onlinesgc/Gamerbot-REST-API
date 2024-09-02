import { Schema, model } from "mongoose";
import { fetchTokenProfileByToken } from "./token_schema";

const token_log_profile_schema = new Schema({
    token_id: { type:Number,require:true},
    request_type: { type:String, require:true},
    request_timestamp: { type:Date, require:true},
    request_data: { type:Object, require:true}
});

const token_log_model = model("tokenLogModel", token_log_profile_schema);

/**
 * fetch token
 * @param id user id
 * @returns token profile
 */
export const fetchTokenLogProfile = async (id:any) =>{
    let tokenLogData = await token_log_model.findOne({token_id:id})
    if(!tokenLogData) return null;
    else return tokenLogData;
}
/**
 * create token log
 * @param token 
 * @param request_type 
 * @param request_timestamp 
 * @param request_data 
 * @returns token log data
 */
export const createTokenLog = async (token_headers:any, request_type:String, request_timestamp:Date, request_data:Object) =>{
    let key = token_headers.split(' ')[1];
    return await _createTokenLog((await fetchTokenProfileByToken(key))?.token_id, request_type, request_timestamp, request_data);
}
const _createTokenLog = async (token_id:any, request_type:String, request_timestamp:Date, request_data:Object) =>{
    let tokenLogData = await token_log_model.create({
        token_id: token_id,
        request_type: request_type,
        request_timestamp: request_timestamp,
        request_data: request_data
    });
    return tokenLogData;
}