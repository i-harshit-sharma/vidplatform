"use server"
import accountModel from "@/models/account";
import { dbConnect } from "@/db/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_ACCESS_SECRET_KEY = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const JWT_REFRESH_SECRET_KEY = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY || JWT_ACCESS_SECRET_KEY.length === 0 || JWT_REFRESH_SECRET_KEY.length === 0 ) {
    throw new Error("JWT secret keys are not defined in environment variables.");
}
export default async function loginUser(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log("[AUTH] loginUser called", { email });

    if (!email || !password) {
        return { message: "Both email and password are required.", email: email || "" };
    }

    try {
        await dbConnect();
        const account = await accountModel.findOne({ email });
        console.log("[AUTH] loginUser db result", { found: !!account });
        if (!account) {
            console.log("[AUTH] loginUser failed: account not found", { email });
            return { message: "Invalid email or password.", email: email || "" };
        }
        const isPasswordValid = await account.comparePassword(password);
        console.log("[AUTH] loginUser password valid", { isPasswordValid });
        if (!isPasswordValid) {
            console.log("[AUTH] loginUser failed: invalid password", { email });
            return { message: "Invalid email or password.", email: email || "" };
        }
        const token = await new SignJWT({ username: account.username.toString(), email: account.email })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime("10 min")
        .setIssuedAt()
        .sign(JWT_ACCESS_SECRET_KEY);
        const refreshToken = await new SignJWT({ username: account.username.toString(), email: account.email })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime("30 days")
        .setIssuedAt()
        .sign(JWT_REFRESH_SECRET_KEY);
        console.log("[AUTH] loginUser tokens generated", { email });

        //TODO Store refresh token in DB for future invalidation if needed

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10, // 10 minutes in seconds
            path: "/",
        });
        cookieStore.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
        });
        console.log("[AUTH] loginUser cookies set", { email });
        // return {
        //     status: 200,
        //     message: "Login successful.",
        //     username: account.username,
        //     email: account.email,
        // };
    } catch (error) {
        console.error("Error during login:", error);
        return { message: "An error occurred during login.", email: email || "" };
    }
    redirect("/");
}