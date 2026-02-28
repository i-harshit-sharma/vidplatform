"use server"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import { withAuth } from "@/libs/auth";
const redis = Redis.fromEnv()

const logoutUser = withAuth(async(user)=>{
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get('refresh_token')?.value;
    console.log("[AUTH] logoutUser called", { email: user.email, refreshToken: currentRefreshToken });
    if (currentRefreshToken) {
        await redis.set(`bl_${currentRefreshToken}`, 'blacklisted', {
            ex: 60 * 60 * 24 * 30, // Blacklist for 30 days
        });
        console.log("[AUTH] logoutUser blacklisted refresh token", { refreshToken: currentRefreshToken });
        cookieStore.delete("auth_token");
        cookieStore.delete("refresh_token");
        console.log("[AUTH] logoutUser cookies deleted", { email: user.email });
        redirect("/login");
    } else {
        // If no refresh token is found, just clear the auth token and redirect
        cookieStore.delete("auth_token");
        console.log("[AUTH] logoutUser cookies deleted (no refresh token)", { email: user.email });
        redirect("/login");
    }
});

export default logoutUser;