import { authDb } from "@/lib/auth-db";

// Fixed-window counters in the auth database (db/rate-limits.sql), shared by every
// serverless instance. Fails open: a limiter outage shouldn't take the app down.
export async function isAllowed(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const { data, error } = await authDb().rpc("hit_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
    });
    if (error) {
        console.error("Rate limit check failed, allowing request:", error.message);
        return true;
    }
    return data === true;
}

// Vercel sets x-forwarded-for to the real client IP.
export function clientIp(request: Request): string {
    return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
