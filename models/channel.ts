import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    about: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    profile_picture_url: { type: String },
    banner_url: { type: String },
    subscribers_count: { type: Number, default: 0 },
    videos_count: { type: Number, default: 0 },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    views_count: { type: Number, default: 0 },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    suggested_channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
    pinned_video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    pinned_playlist: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist" },
    auto_generated: { type: Boolean, default: false },
    //TODO: Implement later
    // posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });

export default mongoose.models.Channel || mongoose.model("Channel", channelSchema);