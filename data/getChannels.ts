"use server"
import { withAuth } from "@/libs/auth";
import accountModel from "@/models/account";
import channelModel from "@/models/channel";
import { dbConnect } from "@/db/db";

export default async function getChannels(username: string) {
    await dbConnect();
    try {
        const channelIDs = await accountModel.find({ username: username }, { channel_id: 1, _id: 0 }).lean();
        
        if (!channelIDs || channelIDs.length === 0) {
            return [];
        }
        const channelNames = await channelModel.find({ _id: { $in: channelIDs[0].channel_id } }).lean();
        const serializedChannelNames = channelNames.map((channel) => ({
            ...channel,
            _id: channel._id.toString(),
            account_id: channel.account_id.toString(),
        }));
        console.log("Channels fetched for user:", serializedChannelNames);
        return serializedChannelNames;
    } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
    }
}