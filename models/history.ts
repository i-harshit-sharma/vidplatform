import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    video_id: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    watched_at: { type: Date, default: Date.now },
    watch_duration: { type: Number, default: 0 }, // Duration in seconds
}, { timestamps: true });

historySchema.index({ account_id: 1, video_id: 1 }, { unique: true });

export default mongoose.models.History || mongoose.model("History", historySchema);