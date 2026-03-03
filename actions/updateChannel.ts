"use server";
import { dbConnect } from "@/db/db";
import { withAuth } from "@/libs/auth";
import channelModel from "@/models/channel";

async function update(user: any, prevState: any, formData: FormData) {
    const channelId = formData.get("channelId") as string;
    const name = formData.get("channelName") as string;
    const about = formData.get("channelAbout") as string;
    const slug = formData.get("channelSlug") as string;

    const profilePic = formData.get("profilePicUrl") as File;  
    const banner    = formData.get("bannerUrl")     as File;   

    const imageBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    console.log("Received form data:", { channelId, name, about, slug, profilePic, banner });
    if (!channelId) {
        return { success: false, error: "Channel ID is missing." };
    }

    if(!name || !about || !slug) {
        return { success: false, error: "Name, About, and Slug are required." };
    }


    try {
        await dbConnect();
        const updatedChannel = await channelModel.findByIdAndUpdate(
            channelId,
            { name, about, slug, profile_picture_url: profilePic ? `${imageBaseUrl}/${profilePic}` : undefined, banner_url: banner ? `${imageBaseUrl}/${banner}` : undefined, 
            auto_generated: false,
        },
            { new: true, runValidators: true },
        ).lean();
        if (!updatedChannel) {
            return { success: false, error: "Channel not found." };
        }
        const serializedChannel = JSON.parse(JSON.stringify(updatedChannel));
        console.log("Updated channel:", serializedChannel); 
        return { success: true , data: serializedChannel};

    } catch (error: any) {
        console.error("[CHANNEL UPDATE] error", error);
        return { success: false, error: error?.message ?? "Failed to update channel." };
    }
}

const updateChannel = withAuth(update)

export default updateChannel;