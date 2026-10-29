import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
// an empty secret would let anyone forge session tokens
if (!secretKey) throw new Error("JWT_SECRET is not set");
const key = new TextEncoder().encode(secretKey);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Define the structure of the session payload
interface SessionPayload extends Record<string, unknown> {
    user: { email: string };
    jti?: string;
    exp?: number;
}

export async function createSessionToken(user: { email: string }) {
    const session = await encrypt({ user });

    // Save the session in a cookie
    (await cookies()).set("session", session, {
        expires: new Date(Date.now() + SESSION_DURATION_MS),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(crypto.randomUUID())
        .setIssuedAt()
        .setExpirationTime('24 hours')
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });

    if (
        !payload.user ||
        typeof payload.user !== "object" ||
        !("email" in payload.user) ||
        !payload.jti
      ) {
        throw new Error("Invalid session");
    }

    return payload as SessionPayload;
}

// Verifies the token and checks it wasn't revoked by logging out (see app/api/logout).
// Uses a plain REST call because this runs in Edge middleware, where supabase-js is heavy.
export async function verifySession(token: string): Promise<SessionPayload> {
    const session = await decrypt(token);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    try {
        const res = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/revoked_sessions?select=jti&jti=eq.${encodeURIComponent(session.jti!)}`,
            { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if ((await res.json()).length > 0) throw new Error("Session revoked");
    } catch (err) {
        if (err instanceof Error && err.message === "Session revoked") throw err;
        // fail open like the rate limiter: an auth-db outage shouldn't sign everyone out
        console.error("Session revocation check failed, allowing session:", err);
    }
    return session;
}

// Email of the signed-in user, or null when there's no valid session.
export async function getSessionEmail(): Promise<string | null> {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;
    try {
        return (await decrypt(token)).user.email;
    } catch {
        return null;
    }
}
