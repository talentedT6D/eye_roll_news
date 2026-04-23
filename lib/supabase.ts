import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabase(): boolean {
  return Boolean(url && anonKey);
}

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!anonClient) anonClient = createClient(url, anonKey);
  return anonClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!adminClient)
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  return adminClient;
}
