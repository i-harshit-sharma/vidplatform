import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    video_id: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);