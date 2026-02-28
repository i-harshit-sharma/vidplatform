import mongoose from "mongoose";
const videoSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true }, // Renamed from 'url' for clarity
    // author_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes_count: { type: Number, default: 0 },
    dislikes_count: { type: Number, default: 0 },
    views_count: { type: Number, default: 0 },
    channel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    video_url: { type: String, required: true }, // The actual AWS S3 / Cloudinary link
    thumbnail_url: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model("Video", videoSchema);