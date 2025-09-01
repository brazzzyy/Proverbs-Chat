import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;

    // If no token, invalidate authentication
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    // If token exists, send the user to their home page
    try {
        await decrypt(token);
        return NextResponse.next();
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/"],
};