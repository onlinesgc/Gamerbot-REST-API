import { Request } from "express";

export default interface KeyRequest extends Request {
  key?: string;
}
