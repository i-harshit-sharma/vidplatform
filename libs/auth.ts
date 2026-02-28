import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv()
const JWT_ACCESS_SECRET_KEY = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

// 1. Helper to verify the token
async function verifyAuth(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    console.log("[AUTH] verifyAuth called", { tokenPresent: !!token });
    if (!token) return null;
    try {
        const verified = await jwtVerify(token, JWT_ACCESS_SECRET_KEY);
        console.log("[AUTH] verifyAuth token verified", { email: verified.payload.email });
        const globalLogoutTime = await redis.get(`global_logout:${verified.payload.email}`) as string | null;
        if (globalLogoutTime && parseInt(globalLogoutTime) > verified.payload.iat!) {
            console.log("[AUTH] verifyAuth global logout detected", { email: verified.payload.email });
            throw new Error("Global logout detected. Please log in again.");
        }
        return verified.payload;
    } catch (err) {
        console.log("[AUTH] verifyAuth error", err);
        return null;
    }
}

// 2. The Higher-Order Wrapper Function
// We use TypeScript generics so it can accept any arguments and return any type
export function withAuth<Args extends any[], ReturnType>(
    action: (user: JWTPayload, ...args: Args) => Promise<ReturnType>
) {
    return async (...args: Args): Promise<ReturnType | { error: string }> => {
        // Run the authentication check
        const user = await verifyAuth();

        if (!user) {
            // You can choose to throw an Error here, but returning an object 
            // is often easier to handle gracefully in the UI.
            return { error: "Unauthorized. Please log in." }; 
        }

        // If authenticated, execute the action and pass the user object along
        // with any original arguments (like FormData)
        return action(user, ...args);
    };
}