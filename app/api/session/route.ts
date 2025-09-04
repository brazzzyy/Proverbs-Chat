import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const hasSession = cookie.includes("session="); // checks for your session cookie

  return NextResponse.json({ isLoggedIn: hasSession });
}
