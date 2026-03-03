import VideoModel from "@/models/video";
import { dbConnect } from "@/db/db";
import { VideoType } from "./getVideos";

export default async function getVideo(slug: string): Promise<VideoType | null> {
    await dbConnect();
    try {
        const video = await VideoModel.findOne({ slug })
            .populate('channel_id', 'name profile_picture_url subscribers_count') 
            .lean();

        if (!video) return null;

        // Convert ObjectId and Dates to string for Client Components boundary
        return JSON.parse(JSON.stringify(video));
    } catch (error) {
        console.error("Error fetching video by slug:", error);
        return null;
    }
}
