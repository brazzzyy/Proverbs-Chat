import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {

    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const email = body.email as string;
        const password = body.password as string;

        // Basic validation
        if (!email || !password) {
            return NextResponse.json({ error: "Missing credential fields "}, { status: 400});
        }
        // Hash/encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Append user's signup data to supabase
        const { data, error } = await supabase
            .from("users")
            .insert([
                { email, 
                  password_hash: hashedPassword 
                }
            ]);

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        await createSessionToken({ email });
        return NextResponse.json({ message: "Sucess" }, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Signup error:", err.message);
          return NextResponse.json({ error: err.message }, { status: 500 });
        }
        console.error("Unknown signup error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}