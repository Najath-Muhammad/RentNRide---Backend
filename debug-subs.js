require('dotenv').config();
const mongoose = require('mongoose');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const subsCollection = db.collection('usersubscriptions');
        const plansCollection = db.collection('subscriptionplans');

        const subs = await subsCollection.find({}).toArray();
        console.log(`Total Subscriptions: ${subs.length}`);

        let withoutAmount = 0;
        let totalRevenue = 0;

        for (const sub of subs) {
            if (sub.amountPaid === undefined || sub.amountPaid === null) {
                withoutAmount++;
                const plan = await plansCollection.findOne({ _id: sub.planId });
                console.log(`Sub: ${sub._id}, Plan Price: ${plan ? plan.price : 'Not Found'}`);

                if (plan && plan.price >= 0) {
                    await subsCollection.updateOne(
                        { _id: sub._id },
                        { $set: { amountPaid: plan.price } }
                    );
                    console.log(`Updated sub ${sub._id} with price ${plan.price}`);
                    totalRevenue += plan.price;
                }
            } else {
                totalRevenue += sub.amountPaid;
            }
        }
        console.log(`Subs missing amount (before update): ${withoutAmount}`);
        console.log(`Total calculated revenue: ${totalRevenue}`);
    } catch (e) {
        console.error(e);
    } finally {
        setTimeout(() => mongoose.disconnect(), 1000);
    }
};

test();
