import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        const formData = await request.formData(); 
        
        // TODO: ^^^ => Add backend logic to append formdata to database
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Basic validation
        if (!email || !password) {
            return NextResponse.json({ error: "Missing credential fields "}, { status: 400});
        }

        await login({ email, password: hashedPassword });
        return NextResponse.json({ message: "User created" }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Error"}, {status: 400 });
    }
}