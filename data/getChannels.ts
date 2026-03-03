"use server"
import { withAuth } from "@/libs/auth";
import accountModel from "@/models/account";
import channelModel from "@/models/channel";
import { dbConnect } from "@/db/db";

export default async function getChannels(username: string) {
    await dbConnect();
    try {
        const accountData = await accountModel.findOne({ username: username }, { channel_id: 1, selected_channel: 1, _id: 0 }).lean();
        
        if (!accountData || !accountData.channel_id || accountData.channel_id.length === 0) {
            return [];
        }
        const channelNames = await channelModel.find({ _id: { $in: accountData.channel_id } }).lean();

        if (accountData.selected_channel) {
            const selectedId = accountData.selected_channel.toString();
            channelNames.sort((a, b) => {
                if (a._id.toString() === selectedId) return -1;
                if (b._id.toString() === selectedId) return 1;
                return 0;
            });
        }

        const serializedChannelNames = channelNames.map((channel) => ({
            ...channel,
            _id: channel._id.toString(),
            account_id: channel.account_id.toString(),
        }));
        return serializedChannelNames;
    } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
    }
}