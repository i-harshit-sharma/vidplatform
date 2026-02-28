export interface UserType {
    username: string;
    email: string;
    password?: string;
    profile_picture_url?: string;
    channel_id?: string;
    subscribed_channels?: string[];
    settings:{
        theme: "light" | "dark" | "system";        
    }
}