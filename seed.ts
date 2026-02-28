
import mongoose from "mongoose";
import Account from "./models/account";
import Channel from "./models/channel";
import Video from "./models/video";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vidPlatform";

async function seed() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("Connected to MongoDB");

		// Clear existing data
		await Promise.all([
			Account.deleteMany({}),
			Channel.deleteMany({}),
			Video.deleteMany({}),
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
			about: "Test channel about section",
			profile_picture_url: "https://placehold.co/100x100",
			banner_url: "https://placehold.co/600x200",
			account_id: account._id,
			subscribers_count: 1,
			videos_count: 1,
			views_count: 0,
		});

		// Update account with channel_id
		account.channel_id = channel._id;
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

		// Update channel with video
		channel.videos = [video._id];
		channel.videos_count = 1;
		await channel.save();

		// Seed notifications for test user
		const Notification = (await import("./models/notifications")).default;
		await Notification.create([
			{
				to: account._id,
				from: account._id,
				type: "welcome",
				message: "Welcome to vidPlatform!",
				viewed: false,
			},
			{
				to: account._id,
				from: account._id,
				type: "info",
				message: "Your channel has been created.",
				viewed: false,
			},
			{
				to: account._id,
				from: account._id,
				type: "video",
				message: "Your first video is live!",
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
