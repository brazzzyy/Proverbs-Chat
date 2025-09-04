import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createSessionToken } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { email, password } = await req.json();

        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from("users")
            .select("email, password_hash")
            .eq("email", email)
            .single();

        if (error) {
            return NextResponse.json({ error: "Something went wrong" }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Create session server-side
        await createSessionToken({
            email: user.email,
        });

        // Return success
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}