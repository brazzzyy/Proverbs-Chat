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
        !("email" in payload.user)
      ) {
        throw new Error("Invalid session");
    }

    return payload as SessionPayload;
}
