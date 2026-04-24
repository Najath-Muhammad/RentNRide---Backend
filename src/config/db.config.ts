import mongoose from "mongoose";
import { env } from "../config/env";

const mongoURI = env.MONGODB_URI;

if (!mongoURI) {
	throw new Error("MONGODB_URI is not defined in the environment variables");
}

const connectDB = async () => {
	try {
        await mongoose.connect(mongoURI, {
			maxConnecting: 100,
			minPoolSize: 10,
		});
    } catch (error) {
		console.error("error connecting :", error);
		process.exit(1);
	}
};

export default connectDB;
