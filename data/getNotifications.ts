import notifications from "@/models/notifications";
import { dbConnect } from "@/db/db";
import account from "@/models/account";

export default async function getNotifications(username: string) {
    await dbConnect();
    
    try {
        const user = await account.findOne({ username }, { _id: 1 }).lean();
        
        if (!user) {
            throw new Error("User not found");
        }
        
        const userNotifications = await notifications.find({ to: user._id, viewed: false }).lean();
        
        // Transform the Mongoose objects into plain JavaScript objects
        if(!userNotifications) {
            return [];
        }
        const serializedNotifications = userNotifications.map((notification) => ({
            ...notification,
            // Convert ObjectIds to strings
            _id: notification._id.toString(),
            to: notification.to.toString(),
            from: notification.from ? notification.from.toString() : null, 
            
            // Convert Dates to ISO strings
            createdAt: notification.createdAt ? notification.createdAt.toISOString() : null,
            updatedAt: notification.updatedAt ? notification.updatedAt.toISOString() : null,
        }));

        return serializedNotifications;
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}