import { randomInt } from "crypto";

export const generateOtp = () => randomInt(100000, 999999).toString();
