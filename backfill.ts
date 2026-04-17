import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserSubscriptionModel, SubscriptionPlanModel } from "./src/model/subscription.model";

dotenv.config();

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB for Backfill");

        const subscriptions = await UserSubscriptionModel.find({
            $or: [{ amountPaid: { $exists: false } }, { amountPaid: 0 }]
        });

        console.log(`Found ${subscriptions.length} subscriptions to backfill.`);

        let updatedCount = 0;
        for (const sub of subscriptions) {
            const plan = await SubscriptionPlanModel.findById(sub.planId);
            if (plan) {
                sub.amountPaid = plan.price;
                await sub.save();
                updatedCount++;
            }
        }
        console.log(`Successfully backfilled ${updatedCount} subscriptions!`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

backfill();
