export interface notificationType {
    _id: string; 
    type: "new_subscriber" | "new_comment" | "video_recommendation" | "subscribed_content";
    message: string;
    image_url?: string;
    post_url?: string;
    viewed: boolean;
    createdAt: Date;
}