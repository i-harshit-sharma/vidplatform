import mongoose from "mongoose";
import Account from "./models/account";
import Channel from "./models/channel";
import Video from "./models/video";
import Notification from "./models/notifications";
import { Comment } from "./models/comment";
import History from "./models/history";
import Playlist from "./models/playlist";
import Subscription from "./models/subscriptions";

const MONGODB_URI = process.env.MONGODB_URI;
if(!MONGODB_URI) {
	console.error("MONGODB_URI is not defined in environment variables");
	process.exit(1);
}
console.log("Using MongoDB URI:", MONGODB_URI);

async function seed() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("Connected to MongoDB");

		// Clear existing data
		await Promise.all([
			Account.deleteMany({}),
			Channel.deleteMany({}),
			Video.deleteMany({}),
			Notification.deleteMany({}),
			Comment.deleteMany({}),
			History.deleteMany({}),
			Playlist.deleteMany({}),
			Subscription.deleteMany({}),
		]);

		// Create account
		const account = await Account.create({
			username: "testuser",
			email: "test@example.com",
			password: "password123",
			profile_picture_url: "https://placehold.co/100x100",
			settings: { theme: "dark", language: "en", location: "US" },
		});

		// Create channel
		const channel = await Channel.create({
			name: "Test Channel",
			slug: "test-channel",
			about: "Test channel about section",
			profile_picture_url: "https://placehold.co/100x100",
			banner_url: "https://placehold.co/600x200",
			account_id: account._id,
			subscribers_count: 1,
			videos_count: 1,
			views_count: 0,
		});

		// Update account with channel_id (it is now an array)
		account.channel_id = [channel._id];
		await account.save();

		// Create video
		const video = await Video.create({
			slug: "test-video-1",
			title: "Test Video",
			description: "This is a test video.",
			channel_id: channel._id,
			video_url: "https://placehold.co/640x360.mp4",
			thumbnail_url: "https://placehold.co/320x180",
		});

		// Create Playlist
		const playlist = await Playlist.create({
			name: "Test Playlist",
			description: "My favorite videos",
			channel_id: channel._id,
			video_ids: [video._id]
		});

		// Update channel with playlist
		channel.playlists = [playlist._id];
		await channel.save();

		// Create a secondary account to test subscriptions and comments
		const fanAccount = await Account.create({
			username: "fanuser",
			email: "fan@example.com",
			password: "password123",
			profile_picture_url: "https://placehold.co/100x100",
		});

		// Create Comment
		await Comment.create({
			author_id: fanAccount._id,
			video_id: video._id,
			content: "Looking forward to more videos!"
		});

		// Create Subscription
		await Subscription.create({
			subscriber_id: fanAccount._id,
			channel_id: channel._id
		});

		// Create History
		await History.create({
			account_id: fanAccount._id,
			video_id: video._id,
			watch_duration: 120
		});

		// Seed notifications with proper enums ("new_subscriber", "new_comment", "video_recommendation", "subscribed_content")
		await Notification.create([
			{
				to: account._id,
				from: fanAccount._id,
				type: "new_subscriber",
				message: "fanuser subscribed to your channel!",
				viewed: false,
			},
			{
				to: account._id,
				from: fanAccount._id,
				type: "new_comment",
				message: "fanuser commented on your video.",
				viewed: false,
			},
			{
				to: fanAccount._id,
				from: account._id,
				type: "video_recommendation",
				message: "Check out this new video from Test Channel!",
				viewed: false,
			},
		]);

		console.log("Database seeded successfully!");
	} catch (err) {
		console.error("Seeding error:", err);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
}

seed();
