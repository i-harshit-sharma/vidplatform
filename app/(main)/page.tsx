import ThemeSwitcher from "@/components/themeSwitcher";
import getVideos, { VideoType } from "@/data/getVideos";
import VideoCard from "@/components/video/VideoCard";

// By removing "use client" this becomes a Server Component 
// capable of directly fetching data via await.
export default async function Home() {
    // 1. Fetch data
    const videos: VideoType[] = await getVideos();

    return (
        <div className="w-full flex flex-col min-h-screen">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">Recommended Videos</h1>
                {/* 2. Client Component for interactivity */}
                <ThemeSwitcher />
            </div>

            <main className="flex-1 p-4 md:p-6 pb-20 max-w-[2000px] mx-auto w-full">
                {videos.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No videos uploaded yet.
                    </div>
                ) : (
                    // YouTube-like responsive grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-4">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}