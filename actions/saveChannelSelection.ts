"use server"
import { withAuth } from "@/libs/auth";
import accountModel from "@/models/account";
import { dbConnect } from "@/db/db";

const saveChannel = async (user:any, channelId: string) => {
    await dbConnect();
    if(!user || !user.email) {
        console.error("User information is missing. Cannot save channel selection.");
        return;
    }
    if(!channelId) {
        console.error("Channel ID is missing. Cannot save channel selection.");
        return;
    }

    console.log("Saving channel selection for user:", user.email, "Channel ID:", channelId);
    try {
        const newUser = await accountModel.findOneAndUpdate(
            { email: user.email },
            { $set: { selected_channel: channelId } },
            { new: true }
        ).lean();
        const serializedUser = JSON.parse(JSON.stringify(newUser));
        // console.log("Channel selection saved successfully:", newUser);
        return serializedUser;
    } catch (error) {
        console.error("Error saving channel selection:", error);
        return null;
    }
}

const saveChannelSelection = withAuth(saveChannel);

export default saveChannelSelection;
