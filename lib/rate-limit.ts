import { createClient } from "@supabase/supabase-js";

// Fixed-window counters in the auth database (db/rate-limits.sql), shared by every
// serverless instance. Fails open: a limiter outage shouldn't take the app down.
export async function isAllowed(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
    const { data, error } = await supabase.rpc("hit_rate_limit", {
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
