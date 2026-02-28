import accountModel from "@/models/account";
import {dbConnect} from "@/db/db";
import { UserType } from "@/types/user";
export default async function getUserInfo(username: string): Promise<UserType | null> {
    await dbConnect();
    try {
        const user = await accountModel.findOne({ username }, {
            _id: 0,
            username: 1,
            email: 1,
            profile_picture_url: 1,
            settings: 1,
        }).lean();
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
    }
}