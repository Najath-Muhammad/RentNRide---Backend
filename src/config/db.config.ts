import { config } from "dotenv";
import mongoose from "mongoose";

config();
const mongoURI = process.env.MONGODB_URI!;

const connectDB = async () => {
	try {
		await mongoose.connect(mongoURI, {
			maxConnecting: 100,
			minPoolSize: 10,
		});
		console.log("connected to MongoDB");
	} catch (error) {
		console.error("error connecting :", error);
		process.exit(1);
	}
};

export default connectDB;
