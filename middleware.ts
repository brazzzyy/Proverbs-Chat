import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;

    try {
        if (!token) throw new Error("No session");
        await decrypt(token);
        return NextResponse.next();
    } catch {
        // API callers get a JSON error the chat UI can show; pages go to login
        if (request.nextUrl.pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/", "/api/chat"],
};
