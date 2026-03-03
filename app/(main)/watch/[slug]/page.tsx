import getVideo from "@/data/getVideo";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

export default async function WatchPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    console.log(slug);
    const video = await getVideo(slug);
    console.log(video);

    if (!video) {
        return notFound();
    }

    // Format views e.g., 1200 -> 1.2K
    const formatViews = (views: number) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
        if (views >= 1000) return (views / 1000).toFixed(1) + "K";
        return views;
    };

    const timeElapsed = video.createdAt
        ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
        : "Just now";

    const channelName = video.channel_id?.name || "Unknown Channel";
    const channelProfilePic = video.channel_id?.profile_picture_url || "/default-avatar.png";
    const subscribers = video.channel_id?.subscribers_count || 0;

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
            {/* Primary Video Column */}
            <div className="flex-1 w-full flex flex-col gap-4">
                {/* Video Player */}
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <video
                        src={video.video_url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        poster={video.thumbnail_url}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Video Title */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {video.title}
                </h1>

                {/* Video Metadata & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                            <Image src={channelProfilePic} alt={channelName} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{channelName}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{formatViews(subscribers)} subscribers</span>
                        </div>
                        <button className="ml-4 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
                            Subscribe
                        </button>
                    </div>

                    {/* Action buttons (Like/Dislike placeholders) */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
                            <button className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-full flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152.26 2.243.723 3.218.266.558.107 1.282-.725 1.282H11.83m-5.197 2.375V19.5c0 1.242.49 2.4 1.32 3.284C8.784 23.67 10 24 11.25 24h3.69c1.693 0 3.204-.962 4-2.454.493-.93.75-2.006.75-3.14V13.5a2.25 2.25 0 0 0-2.25-2.25H11.83" />
                                </svg>
                                <span className="text-sm font-medium">{formatViews(video.likes_count)}</span>
                            </button>
                            <button className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.236 4.248 6.574 4 7.498 4h10.252c1.242 0 2.4.49 3.284 1.32.89.884 1.32 2.042 1.32 3.284v3.69c0 1.14-.26 2.215-.752 3.14-.796 1.492-2.307 2.454-4 2.454h-3.69c-.888 0-1.6.711-1.6 1.6 0 .584.225 1.114.595 1.5.385.405.908.647 1.465.647h.176c.553 0 1.056-.445 1.488-.934.331-.375.76-.666 1.229-.666.974 0 1.905.378 2.595.952.559.467.935 1.129 1.135 1.833a4.743 4.743 0 0 1 .15 1.218v1.396A.75.75 0 0 1 18.172 24h-3.664a2.25 2.25 0 0 1-2.25-2.25c0-.623-.26-1.196-.689-1.597a4.498 4.498 0 0 0-1.653-.941 9.041 9.041 0 0 1-2.861-2.4c-.498-.634-1.225-1.08-2.031-1.08h-2.126z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Description Box */}
                <div className="bg-gray-100 dark:bg-gray-800/80 rounded-xl p-4 mt-2 mb-8">
                    <div className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                        {formatViews(video.views_count)} views • {timeElapsed}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {video.description}
                    </p>
                </div>
            </div>

            {/* Sidebar Column (Placeholder for recommendations) */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4">
                {/* Later: We would render a list of VideoCards horizontally-oriented here */}
            </div>
        </div>
    );
}
