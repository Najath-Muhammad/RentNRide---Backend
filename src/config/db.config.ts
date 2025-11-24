
import mongoose from "mongoose"
import { config } from 'dotenv';

config()
const mongoURI = process.env.MONGODB_URI!


const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            // dbName:"" // db name required;
            maxConnecting: 100,
            minPoolSize: 10
        });
        console.log('connected to MongoDB');
    } catch (error) {
        console.error('error connecting :', error);
        process.exit(1);

    }
}

export default connectDB;