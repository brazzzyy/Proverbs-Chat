import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;

    // If no token, invalidate authentication
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        await decrypt(token);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/"],
};