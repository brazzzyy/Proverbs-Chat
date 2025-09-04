import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "session",
    value: "",         // empty value
    maxAge: 0,         // expire immediately
    httpOnly: true,    // secure, not accessible from JS
    path: "/",         // available on all routes
  });

  return response;
}
