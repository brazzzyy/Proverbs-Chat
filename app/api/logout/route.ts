import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { authDb } from "@/lib/auth-db";

// Records the token as revoked so a copied cookie stops working, then clears it.
async function revokeSession(token: string) {
  let session;
  try {
    session = await decrypt(token);
  } catch {
    return; // already invalid
  }

  const db = authDb();
  const { error } = await db.from("revoked_sessions").upsert({
    jti: session.jti,
    expires_at: new Date(session.exp! * 1000).toISOString(),
  });
  if (error) throw new Error(`Couldn't revoke session: ${error.message}`);

  // expired tokens are rejected anyway, so their rows can go
  await db.from("revoked_sessions").delete().lt("expires_at", new Date().toISOString());
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (token) {
    try {
      await revokeSession(token);
    } catch (err) {
      // still clear the cookie; the token expires on its own within 24 hours
      console.error("Logout error:", err);
    }
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "session",
    value: "",
    maxAge: 0,
    httpOnly: true,
    path: "/",
  });

  return response;
}
