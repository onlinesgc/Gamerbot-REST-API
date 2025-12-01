import { Types } from "mongoose";

export const toDotNotation = (
    obj: Record<string, unknown>,
    prefix = "",
    res: Record<string, unknown> = {},
) => {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            !(value instanceof Types.ObjectId) &&
            !(value instanceof Map)
        ) {
            toDotNotation(value as Record<string, unknown>, newKey, res);
        } else {
            res[newKey] = value;
        }
    }
    return res;
};
