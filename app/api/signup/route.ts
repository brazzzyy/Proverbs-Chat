import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { authDb } from "@/lib/auth-db";
import { isAllowed, clientIp } from "@/lib/rate-limit";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {

    // limits throwaway accounts: 5 signups per hour per IP
    if (!(await isAllowed(`signup:${clientIp(request)}`, 5, 60 * 60))) {
        return NextResponse.json({ error: "Too many accounts created from this network. Please try again later." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        // Basic validation (the form checks too, but requests can skip it)
        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await authDb()
            .from("users")
            .insert({ email, password_hash: hashedPassword });

        if (error) {
            // unique_email constraint
            if (error.code === "23505") {
                return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
            }
            throw error;
        }

        await createSessionToken({ email });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
