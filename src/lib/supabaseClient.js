import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // createClient() throws synchronously on a missing URL, which would
  // crash the whole app at import time (before any route even renders) —
  // log instead and leave `supabase` null so callers can show a friendly
  // "not configured yet" state. Copy .env.local.example to .env.local and
  // fill in your Supabase project's URL/anon key, then restart the dev
  // server.
  console.error(
    "Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY. " +
      "Copy .env.local.example to .env.local and fill in your Supabase project's values, then restart the dev server."
  );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
