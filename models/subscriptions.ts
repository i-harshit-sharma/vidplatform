import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
}, { timestamps: true });

subscriptionSchema.index({ subscriber_id: 1, channel_id: 1 }, { unique: true });

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);