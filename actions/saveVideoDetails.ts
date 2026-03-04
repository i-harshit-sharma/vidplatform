"use server";
import { withAuth } from "@/libs/auth";
import VideoModel from "@/models/video";
import { dbConnect } from "@/db/db";
import { Client as QStashClient } from "@upstash/qstash";

const qstashClient = new QStashClient({
    baseUrl:"https://qstash-eu-central-1.upstash.io",
    token: process.env.QSTASH_TOKEN  // Fallback to avoid crashes locally if env not set
});

const saveVideo = async (user: any, title: string, description: string, channel_id: string, video_url: string, thumbnail_url: string) => {
    await dbConnect();

    // basic validation
    if (!title || !description || !channel_id || !video_url || !thumbnail_url) {
        return { error: "Missing required fields" };
    }

    // generating a simple slug
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${slugBase}-${Date.now()}`;

    try {
        const newVideo = await VideoModel.create({
            slug,
            title,
            description,
            channel_id,
            video_url,
            thumbnail_url,
            r2Url: video_url,
            hlsUrl: video_url,
            processing_status: "processing",
            ready_to_be_served: false,
        });

        // Trigger background job to process the video
        try {
            await qstashClient.publishJSON({
                url: `${process.env.PROCESSOR_URL}/api/ingest`,
                headers: {
                    "Content-Type": "application/json",
                    "origin": process.env.ORIGIN_URL!,
                },
                body: {
                    videoId: newVideo._id.toString(),
                    r2Url: video_url
                },
            });

            // console.log(result);
            console.log(`QStash background job published for video ${newVideo._id}`);
        } catch (qstashError) {
             console.error("Failed to publish QStash job, but video was saved:", qstashError);
             // We don't fail the upload just because the webhook failed
        }

        // Convert the mongoose document to a plain JS object to pass across server-client boundary
        const serializedVideo = JSON.parse(JSON.stringify(newVideo.toObject ? newVideo.toObject() : newVideo));
        return { success: true, video: serializedVideo,  };
    } catch (error: any) {
        console.error("Error saving video details:", error);
        return { error: error.message || "Failed to save video details" };
    }
}

export default withAuth(saveVideo);
