import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    video_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
}, { timestamps: true });

export default mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);