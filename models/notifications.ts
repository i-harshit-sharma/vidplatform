import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["new_subscriber", "new_comment", "video_recommendation", "subscribed_content"], required: true }, 
    message: { type: String, required: true },
    image_url: { type: String }, 
    post_url: { type: String },
    viewed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);