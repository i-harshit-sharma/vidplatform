import VideoModel from "@/models/video";
import "@/models/channel";
import { dbConnect } from "@/db/db";

// Use partial Record for the types roughly matching the mongoose schema
export type VideoType = {
    _id: string;
    slug: string;
    title: string;
    description: string;
    likes_count: number;
    dislikes_count: number;
    views_count: number;
    channel_id: string | any; // Could be populated channel
    video_url: string;
    thumbnail_url: string;
    createdAt?: string;
    updatedAt?: string;
    r2Url: string;
    hlsUrl: string;
};

export default async function getVideos(): Promise<VideoType[]> {
    await dbConnect();
    try {
        const videos = await VideoModel.find({})
            .populate('channel_id', 'name profile_picture_url') // Optionally populate basic channel info
            .sort({ createdAt: -1 })
            .lean();

        // Convert ObjectId and Dates to string for Client Components boundary
        return JSON.parse(JSON.stringify(videos));
    } catch (error) {
        console.error("Error fetching videos:", error);
        return [];
    }
}
