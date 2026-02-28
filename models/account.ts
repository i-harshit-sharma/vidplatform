import mongoose from "mongoose";
import { languages, themes } from "@/constants/constants";
import bcrypt from "bcrypt";

const notificationSchema = new mongoose.Schema(
	{
		enabled: { type: Boolean, default: false },
		email_notifications: { type: Boolean, default: true },
		sms_notifications: { type: Boolean, default: false },
		push_notifications: { type: Boolean, default: false },
		dont_notify_channels: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Channel",
			default: [],
		},
		fewer_notifications: { type: Boolean, default: false },
		unwatched_video_notifications: { type: Number, default: 0 },
	},
	{ _id: false },
);

const settingsSchema = new mongoose.Schema(
	{
		theme: { type: String, enum: themes, default: "light" },
		language: { type: String, enum: languages, default: "en" },
		notifications: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Notification",
		},
		location: { type: String, default: "US" },
		restricted_mode: { type: Boolean, default: false },
		parental_controls: { type: Object, default: {} },
		notification_settings: {
			type: notificationSchema,
			default: () => ({}),
		},
	},
	{ _id: false },
);

const accountSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		profile_picture_url: { type: String },
		channel_id: { type: [mongoose.Schema.Types.ObjectId], ref: "Channel" },
		settings: { type: settingsSchema, default: () => ({}) },
	},
	{ timestamps: true },
);

accountSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	try {
		const salt = await bcrypt.genSalt(14);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (err) {
		throw err;
	}
});

accountSchema.methods.comparePassword = async function (
	candidatePassword: string,
) {
	return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Account ||
	mongoose.model("Account", accountSchema);
