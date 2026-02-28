"use server"
import { withAuth } from "@/libs/auth";
import account from "@/models/account"
const setTheme = withAuth(async(user: any, theme: "light" | "dark" | "system")=>{
    console.log("[AUTH] setTheme called", { email: user.email, theme });
    await account.updateOne({ email: user.email }, { $set: { "settings.theme": theme } });
})

export default setTheme;