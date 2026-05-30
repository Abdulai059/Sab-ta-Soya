import { createClient } from "@supabase/supabase-js";

// Fallback to placeholder strings so the module loads during build time.
// Actual queries will fail gracefully at runtime if env vars are truly missing.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
