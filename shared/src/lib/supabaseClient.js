// shared/src/lib/supabaseClient.js
// Central Supabase client for all apps (student, admin, delivery)
// Uses environment variables injected by Vercel (NEXT_PUBLIC_*) for the anon key
// and a server‑only SERVICE_ROLE_KEY for server‑side functions.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase env vars missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for server‑side functions where we need a service role key.
export const createServiceSupabase = (serviceKey) => {
  if (!serviceKey) {
    throw new Error("Service role key required for privileged actions");
  }
  return createClient(supabaseUrl, serviceKey);
};
