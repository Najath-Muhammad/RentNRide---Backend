import { randomInt } from "node:crypto";

export const generateOtp = () => randomInt(100000, 999999).toString();
