import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { VideoType } from "@/data/getVideos";

export default function VideoCard({ video }: { video: VideoType }) {
    // Format views e.g., 1200 -> 1.2K
    const formatViews = (views: number) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
        if (views >= 1000) return (views / 1000).toFixed(1) + "K";
        return views;
    };

    // Calculate time elapsed
    const timeElapsed = video.createdAt
        ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
        : "Just now";

    // Assuming channel_id can be populated
    const channelName = video.channel_id?.name || "Unknown Channel";
    const channelProfilePic = video.channel_id?.profile_picture_url || "/default-avatar.png";

    return (
        <Link href={`/watch/${video.slug}`} className="flex flex-col gap-3 group cursor-pointer w-full">
            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    unoptimized // if testing with external URLs not in next.config
                />
            </div>

            {/* Default Avatar & Details */}
            <div className="flex gap-3 pr-6">
                <div className="flex-shrink-0 mt-1">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                        <Image
                            src={channelProfilePic}
                            alt={channelName}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>

                <div className="flex flex-col text-sm w-full">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                        {video.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {channelName}
                    </p>
                    <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>{formatViews(video.views_count)} views</span>
                        <span className="text-[10px]">•</span>
                        <span>{timeElapsed}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
