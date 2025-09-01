import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(secretKey);

// Define the structure of the session payload
interface SessionPayload extends Record<string, unknown> {
    user: { email: string };
    expires?: Date;
}

type User = {
    email: string,
    password: string
}

export async function login(user: User) {
    // !! TODO: Validate "user: User" below for database integration with Postgres!!
    if (!user.email || !user.password) {
        throw new Error("Invalid Credentials");
    }
    // Create the session
    // TODO: 10 seconds just for testing right now, change it to 24 hours upon database integration
    const expires = new Date(Date.now() + 10 * 1000);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
    // Terminate the session
    (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('10 seconds from now')
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

export async function getSession() {
    const session = (await cookies()).get('session')?.value;

    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh the session to prevent expiration
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 10 * 1000); 
    const res = NextResponse.next();
    res.cookies.set({ 
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });

    return res;
}

