"use server"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import { withAuth } from "@/libs/auth";
const redis = Redis.fromEnv()

const globalLogout = withAuth(async(user)=>{
    const cookieStore = await cookies();
    const currentTimeSeconds = Math.floor(Date.now()/1000);
    console.log("[AUTH] globalLogout called", { email: user.email });
    if(cookieStore.get('refresh_token')?.value){
        await redis.set(`global_logout:${user.email}`, currentTimeSeconds, {
            ex: 60 * 60 * 24 * 30, // Store till all tokens expire
        });
        console.log("[AUTH] globalLogout set global logout", { email: user.email, time: currentTimeSeconds });
    }

    cookieStore.delete("auth_token");
    cookieStore.delete("refresh_token");
    console.log("[AUTH] globalLogout cookies deleted", { email: user.email });
    redirect("/login");
})

export default globalLogout;