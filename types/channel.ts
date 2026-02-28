export interface channelType{
    _id: string;
    name: string;
    about: string;
    slug: string;
    isVerified: boolean;
    profile_picture_url?: string;
    banner_url?: string;
    subscribers_count: number;
    videos_count: number;
    account_id: string;
    views_count: number;
    playlists?: string[];
    suggested_channels?: string[];
    pinned_video?: string;
    pinned_playlist?: string;
    auto_generated: boolean;

}