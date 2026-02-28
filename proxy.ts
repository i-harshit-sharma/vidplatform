import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// 1. PERFORMANCE: Encode secrets once at the module level
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secret keys are not defined in environment variables.");
}

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    console.log("[AUTH] proxy called", { pathname, accessTokenPresent: !!accessToken, refreshTokenPresent: !!refreshToken });
    const isPublicRoute = pathname === '/login' || pathname === '/register';
    // 2. PUBLIC ROUTES LOGIC
    if (isPublicRoute) {
        if (accessToken) {
            try {
                const verify = await jwtVerify(accessToken, ACCESS_SECRET);
                const globalLogoutTime = await redis.get(`global_logout:${verify.payload.email}`) as string | null;
                console.log("[AUTH] proxy public route access token verified", { email: verify.payload.email });
                if (globalLogoutTime && parseInt(globalLogoutTime) > verify.payload.iat!) {
                    console.log("[AUTH] proxy global logout detected (public route)", { email: verify.payload.email });
                    return await logoutRedirect(request);
                }
                return NextResponse.redirect(new URL('/', request.url));
            } catch (err) {
                console.log("[AUTH] proxy access token invalid (public route)", err);
                // Access token invalid, but let's check if we can refresh before forcing login
                if (refreshToken) {
                   return await attemptTokenRefresh(request, refreshToken, true);
                }
            }
        }
        return clearUserHeaders(request);
    }
    // 3. PROTECTED ROUTES LOGIC
    if (!accessToken && !refreshToken) {
        console.log("[AUTH] proxy no tokens for protected route", { pathname });
        return await logoutRedirect(request);
    }
    try {
        if (accessToken) {
            const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
            const globalLogoutTime = await redis.get(`global_logout:${payload.email}`) as string | null;
            console.log("[AUTH] proxy protected route access token verified", { email: payload.email });
            if (globalLogoutTime && parseInt(globalLogoutTime) > payload.iat!) {
                console.log("[AUTH] proxy global logout detected (protected route)", { email: payload.email });
                return await logoutRedirect(request);
            }
            return forwardUserHeaders(request, payload);
        }
        throw new Error("Access token missing");
    } catch (error) {
        console.log("[AUTH] proxy access token failed, attempting refresh", error);
        // Access token failed, attempt refresh
        if (refreshToken) {
            return await attemptTokenRefresh(request, refreshToken, false);
        }
        return await logoutRedirect(request);
    }
}


async function attemptTokenRefresh(request: NextRequest, refreshToken: string, isPublicRoute: boolean) {
    try {
        console.log("[AUTH] attemptTokenRefresh called", { refreshToken, isPublicRoute });
        // 1. GRACE PERIOD CHECK: Did they just try to refresh a few seconds ago?
        const graceData = await redis.get<{ newAccessToken: string, newRefreshToken: string }>(`grace_${refreshToken}`);
        
        if (graceData) {
            // It's a network retry. Send them the exact same tokens we just generated for them.
            const { newAccessToken, newRefreshToken } = graceData;
            console.log("[AUTH] attemptTokenRefresh grace period hit", { refreshToken });
            return applyTokensToResponse(request, newAccessToken, newRefreshToken, isPublicRoute, null); 
            // Note: We pass null for payload here because we don't need to forward user headers 
            // if we are just returning tokens on a retry, or you can extract the payload if needed.
        }

        // 2. BLACKLIST CHECK: If not in grace period, is it blacklisted?
        const isBlacklisted = await redis.get(`bl_${refreshToken}`);
        if (isBlacklisted) {
            console.log("[AUTH] attemptTokenRefresh refresh token blacklisted", { refreshToken });
            throw new Error("Refresh token is blacklisted");
        }

        // 3. VERIFY TOKEN
        const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
        const globalLogoutTime = await redis.get(`global_logout:${payload.email}`) as string | null;
        console.log("[AUTH] attemptTokenRefresh refresh token verified", { email: payload.email });
        if (globalLogoutTime && parseInt(globalLogoutTime) > payload.iat!) {
            console.log("[AUTH] attemptTokenRefresh global logout detected", { email: payload.email });
            return await logoutRedirect(request);
        }
        
        // 4. GENERATE NEW TOKENS
        const newAccessToken = await new SignJWT({ username: payload.username, email: payload.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("15m")
            .setIssuedAt()
            .sign(ACCESS_SECRET);
        const newRefreshToken = await new SignJWT({ username: payload.username, email: payload.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("30d")
            .setIssuedAt()
            .sign(REFRESH_SECRET);
        console.log("[AUTH] attemptTokenRefresh new tokens generated", { email: payload.email });

        // 5. UPDATE REDIS: Save to grace period AND blacklist
        // Save the new tokens for 60 seconds in case of network retries
        await redis.set(`grace_${refreshToken}`, { newAccessToken, newRefreshToken }, { ex: 60 });
        // Blacklist the old refresh token permanently (for its 30-day lifespan)
        await redis.set(`bl_${refreshToken}`, "blacklisted", { ex: 60 * 60 * 24 * 30 });
        console.log("[AUTH] attemptTokenRefresh old refresh token blacklisted", { refreshToken });

        // 6. RETURN RESPONSE
        return applyTokensToResponse(request, newAccessToken, newRefreshToken, isPublicRoute, payload);
    } catch (refreshError) {
        console.log("[AUTH] attemptTokenRefresh error", refreshError);
        return await logoutRedirect(request);
    }
}

// Helper function to keep things clean since we are sending tokens from two different places now
function applyTokensToResponse(
    request: NextRequest, 
    accessToken: string, 
    refreshToken: string, 
    isPublicRoute: boolean,
    payload: any | null
) {
    const response = isPublicRoute 
        ? NextResponse.redirect(new URL('/', request.url))
        : (payload ? forwardUserHeaders(request, payload) : NextResponse.next());

    const cookieOptions = {
        httpOnly: true, 
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
    };

    response.cookies.set('auth_token', accessToken, { ...cookieOptions, maxAge: 900 });
    response.cookies.set('refresh_token', refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });

    return response;
}

function forwardUserHeaders(request: NextRequest, payload: any) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-name', payload.username as string);
    requestHeaders.set('x-user-email', payload.email as string);
    
    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

function clearUserHeaders(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('x-user-name');
    requestHeaders.delete('x-user-email');
    
    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

async function logoutRedirect(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    const currentRefreshToken = request.cookies.get('refresh_token')?.value;
    
    // 4. FIX: Removed duplicate Redis call and ensured it only runs if token exists
    if (currentRefreshToken) {
        await redis.set(`bl_${currentRefreshToken}`, 'blacklisted', {
            ex: 60 * 60 * 24 * 30, // 30 days
        });
    }
    
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};