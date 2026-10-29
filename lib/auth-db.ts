import { createClient } from "@supabase/supabase-js";

// Service-role client for the auth database. Server-only: it bypasses RLS.
export function authDb() {
    return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}
