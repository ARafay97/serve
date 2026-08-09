import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Every database read and write in this app goes through a Next.js route
 * handler, so the service-role key never reaches the browser and there is no
 * `NEXT_PUBLIC_*` Supabase variable to leak. The client is created lazily so
 * that `next build` succeeds with an empty .env.local — the error surfaces on
 * the first request instead of at build time.
 */
let cached: SupabaseClient | null = null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "in .env.local (local) or in the Vercel project's environment variables.",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseNotConfiguredError();
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
