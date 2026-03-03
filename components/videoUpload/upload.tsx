"use client";

import { useState } from "react";
import axios from "axios";
import getUploadURL from "@/actions/getUploadURL";
import saveVideoDetails from "@/actions/saveVideoDetails";
import { useChannels } from "@/context/ChannelContext";


export default function UploadForm() {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileSize, setFileSize] = useState(0);
    const { channels } = useChannels();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [channelId, setChannelId] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("video/")) {
            alert("Please select a valid video file.");
            return;
        }

        if (!title || !description || !channelId || !thumbnailFile) {
            alert("Please fill in all details and upload a thumbnail first.");
            return;
        }

        setIsUploading(true);
        setFileSize(file.size);
        setProgress(0);

        try {
            // 1. Upload Thumbnail
            let finalThumbnailUrl = "";
            if (thumbnailFile) {
                const thumbnailExt = thumbnailFile.name.split('.').pop() || "jpg";
                const thumbnailUploadResult = await getUploadURL(thumbnailFile.name, thumbnailExt, thumbnailFile.type);
                if ('error' in thumbnailUploadResult) {
                    alert("Failed to get thumbnail upload URL: " + thumbnailUploadResult.error);
                    setIsUploading(false);
                    return;
                }
                const { signedUrl: thumbnailSignedUrl, uploadFileName: thumbnailUploadFileName } = thumbnailUploadResult;

                await axios.put(thumbnailSignedUrl, thumbnailFile, {
                    headers: { "Content-Type": thumbnailFile.type },
                });
                const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
                finalThumbnailUrl = `${publicBaseUrl}/${thumbnailUploadFileName}`;
            }

            // 2. Get the Signed URL for Video
            const fileExt = file.name.split('.').pop() || "mp4";
            const uploadResult = await getUploadURL(file.name, fileExt, file.type);
            if ('error' in uploadResult) {
                alert("Failed to get upload URL: " + uploadResult.error);
                return;
            }
            const { signedUrl, uploadFileName } = uploadResult;

            // 3. Upload with Axios to track progress
            await axios.put(signedUrl, file, {
                headers: { "Content-Type": file.type },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    }
                },
            });

            const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
            const finalVideoUrl = `${publicBaseUrl}/${uploadFileName}`;

            // 4. Save Video Metadata
            const saveResult = await saveVideoDetails(title, description, channelId, finalVideoUrl, finalThumbnailUrl);

            if (saveResult && 'error' in saveResult) {
                alert("Failed to save video details: " + saveResult.error);
                return;
            }

            alert("Upload successful!");
            setTitle("");
            setDescription("");
            setChannelId("");
            setThumbnailFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Check the console for details.");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <>
            <form>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Video Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your video title"
                    required
                />
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Video Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="block w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your video description"
                    required
                ></textarea>
                <label
                    htmlFor="channel"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Select Channel
                </label>
                <select
                    id="channel"
                    name="channel"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                >
                    <option value="">Select a channel</option>
                    {channels?.map((channel) => (
                        <option key={channel._id || channel.name} value={channel._id || channel.name}>
                            {channel.name}
                        </option>
                    ))}
                </select>
                <label htmlFor="thumbnail">Upload Thumbnail</label>
                <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 mb-4"
                />
            </form>
            <div className="space-y-4 p-4 border rounded-lg max-w-md">
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {isUploading && (
                    <div className="w-full">
                        <div className="flex justify-between mb-1 text-sm font-medium text-blue-700">
                            <span>Uploading...</span>
                            <span>
                                {progress}% of (
                                {Math.round((fileSize / 1024 / 1024) * 100) / 100} MB)
                            </span>
                        </div>
                        Please wait while your video is being uploaded. Do not close this window.
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
