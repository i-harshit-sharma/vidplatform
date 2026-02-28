"use server"
import accountModel from "@/models/account";
import channelModel from "@/models/channel";
import { dbConnect } from "@/db/db";


// useActionState passes the previous state as the first arg, and FormData as the second.
export default async function createUser(prevState: any, formData: FormData) {
    // Extract values using the "name" attributes from the form inputs
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log("[AUTH] createUser called", { username, email });

    if (!username || !email || !password) {
        return { message: "All fields are required.", email: email || "" };
    }

    
    try {
        // Create the user account
        await dbConnect();
        const newAccount = new accountModel({ username, email, password });
        const savedAccount = await newAccount.save();
        console.log("[AUTH] createUser account created", { username, email });
        // Create the user's channel
        const newChannel = new channelModel({ account_id: savedAccount._id, name: `${username}'s Channel`, slug: `${username}-channel`, auto_generated: true, profile_picture_url: "https://avatars.jakerunzer.com/defaut" });
        const savedChannel = await newChannel.save();
        console.log("[AUTH] createUser channel created", { channelId: savedChannel._id });
        // Update the account with the channel ID
        savedAccount.channel_id.push(savedChannel._id);
        await savedAccount.save();
        console.log("[AUTH] createUser account updated with channel", { username, email, channelId: savedChannel._id });
        // Return the success message so your client component can display it
        return {
            status: 201,
            message: "User registered successfully!",
            username: savedAccount.username,
            email: savedAccount.email,
            profile_picture_url: savedAccount.profile_picture_url,
        };
    // ... inside createUser.ts ...
    } catch (error: any) {
        console.error("[AUTH] createUser error", error);
        
        // 1. Intercept the MongoDB Duplicate Key Error
        if (error.code === 11000) {
            // error.keyPattern usually looks like { username: 1 } or { email: 1 }
            // We can extract the key name to make the message dynamic
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            
            // Capitalize the field name for the UI (e.g., 'Username' or 'Email')
            const formattedField = duplicateField 
                ? duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1) 
                : 'Value';

            return { 
                status: 400,
                message: `That email or username is already taken. Please choose another one.`, 
                email: email || "" 
            };
        }

        // 2. Fallback for any other type of error
        return { 
            status: 500,
            message: "Failed to create account. Please try again.", 
            email: email || "" 
        };
    }
}