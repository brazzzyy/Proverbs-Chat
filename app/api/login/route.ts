import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createSessionToken } from "@/lib/auth";
import { authDb } from "@/lib/auth-db";
import { isAllowed, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {

    // slows password guessing: 10 attempts per 15 minutes per IP
    if (!(await isAllowed(`login:${clientIp(req)}`, 10, 15 * 60))) {
        return NextResponse.json({ error: "Too many sign-in attempts. Please wait a few minutes and try again." }, { status: 429 });
    }

    try {
        const body = await req.json();
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!email || !password) {
            return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
        }

        // Fetch user from Supabase
        const { data: user, error } = await authDb()
            .from("users")
            .select("email, password_hash")
            .eq("email", email)
            .maybeSingle();

        if (error) throw error;

        // Same message for unknown email and wrong password so accounts can't be probed
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Create session server-side
        await createSessionToken({ email: user.email });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
