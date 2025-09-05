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

type SessionUser = {
    email: string;
    id?: string;
};

export async function createSessionToken(user: SessionUser) {
    // Create the session (24 hours before expiration)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
    const cookieStore = await cookies();

    // Terminate the session
    cookieStore.set({
    name: "session",
    value: "",        
    maxAge: 0,       
    httpOnly: true,   
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", 
    path: "/",
    expires: parsed.expires,
});

    return res;
}