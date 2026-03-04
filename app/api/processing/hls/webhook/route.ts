import { NextRequest, NextResponse } from "next/server";
import videoModel from "@/models/video";
export async function POST(request: NextRequest) {
    try {
        const { videoId, status, message, hlsUrl, error, audioUrl } = await request.json();
        

        if(!videoId || !hlsUrl) {
            return NextResponse.json({ error: "Missing videoId or hlsUrl" }, { status: 400 });
        }

        if(status !== "success") {
            const video = await videoModel.findById(videoId);
            if (!video) {
                return NextResponse.json({ error: "Video not found" }, { status: 404 });
            }
            video.processing_status = "failed";
            console.log(`Processing failed for video ${videoId}: ${message || error || "Unknown error"}`);
            await video.save();
        }

        const video = await videoModel.findById(videoId);
        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }
        video.hlsUrl = hlsUrl;
        video.processing_status = "running ai";

        await video.save();
        console.log(`HLS URL updated for video ${videoId}. Processing status set to running ai.`);
       //Send audio URL to audio processing webhook
        console.log("sending audio URL to audio processing webhook:", audioUrl);
       //Send video frames to video processing webhook
        console.log("sending video frames to video processing webhook:", hlsUrl);

        return NextResponse.json({ message: "HLS URL updated and processing status set to running ai" });
    } catch (error) {
        console.error("Error updating HLS URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}