import connectDB from "./src/config/mongo.config";
import { UserSubscriptionModel, SubscriptionPlanModel } from "./src/model/subscription.model";
import mongoose from "mongoose";

const test = async () => {
    try {
        await connectDB();
        const subs = await UserSubscriptionModel.find({});
        console.log(`Total Subscriptions: ${subs.length}`);

        let withoutAmount = 0;
        let totalRevenue = 0;
        for (const sub of subs) {
            if (!sub.amountPaid) withoutAmount++;
            totalRevenue += sub.amountPaid || 0;

            if (!sub.amountPaid) {
                const plan = await SubscriptionPlanModel.findById(sub.planId);
                console.log(`Sub: ${sub._id}, Plan Price: ${plan?.price}`);
                if (plan && plan.price >= 0) {
                    sub.amountPaid = plan.price;
                    try {
                        await sub.save();
                        console.log(`Saved ${sub._id} with ${plan.price}`);
                        totalRevenue += plan.price;
                    } catch (e) {
                        console.error(`Failed to save ${sub._id}:`, e);
                    }
                }
            }
        }
        console.log(`Subs without amount: ${withoutAmount}`);
        console.log(`Total calculated revenue: ${totalRevenue}`);
    } catch (e) {
        console.error("error!", e);
    } finally {
        setTimeout(() => mongoose.disconnect(), 1000);
    }
};

test();
