import { createClient } from "@supabase/supabase-js";

const env = import.meta.env as Record<string, string | undefined>;
const runtimeEnv = typeof process !== "undefined" ? process.env : {};
const url = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? runtimeEnv.NEXT_PUBLIC_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? runtimeEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}
