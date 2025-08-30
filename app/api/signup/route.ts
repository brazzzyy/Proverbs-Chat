import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const formData = await request.formData(); 
        
        // TODO: ^^^ => Add backend logic to append formdata to database
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing credential fields "}, { status: 400});
        }

        await login(formData);

        return NextResponse.json({ message: "User created" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error"}, {status: 400 });
    }
}