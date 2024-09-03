import { Schema, model } from "mongoose";

const token_profile_schema = new Schema({
    token: { type:String, require: true, unique:true},
    usage: {type:String, require:true},
    token_id: {type:Number, unique:true, require:true}, 
});

const token_model = model("tokenModel", token_profile_schema);

/**
 * fetch token
 * @param id token id
 * @returns token profile
 */
export const fetchTokenProfile = async (id:Number) =>{
    let tokenData = await token_model.findOne({token_id:id})
    if(!tokenData) return null;
    else return tokenData;
}

/**
 * fetch profile
 * @param token token
 * @returns token profile
 */
export const fetchTokenProfileByToken = async (token:String) =>{
    let tokenData = await token_model.findOne({token:token})
    if(!tokenData) return null;
    else return tokenData;
}