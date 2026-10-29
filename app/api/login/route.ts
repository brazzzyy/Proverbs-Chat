import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createSessionToken } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {

    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.json();
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!email || !password) {
            return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
        }

        // Fetch user from Supabase
        const { data: user, error } = await supabase
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
