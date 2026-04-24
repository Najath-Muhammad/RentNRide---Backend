const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('node:path');

// Fix path to .env
dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
    fcmTokens: { type: [String], default: [] }
}, { collection: 'users' });

const UserModel = mongoose.model('User', UserSchema);

async function checkTokens() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is not defined");

        await mongoose.connect(uri);
        console.log("Connected to DB");
        const usersWithTokens = await UserModel.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
        console.log(`Found ${usersWithTokens.length} users with FCM tokens.`);
        usersWithTokens.forEach(u => {
            console.log(`User ${u._id}: ${u.fcmTokens.length} tokens`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkTokens();
