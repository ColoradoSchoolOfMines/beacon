/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

// Validate environment variables
if (import.meta.env.VITE_SUPABASE_URL === undefined) {
  throw new Error("Environment variable VITE_SUPABASE_URL must be set!");
}

if (import.meta.env.VITE_SUPABASE_KEY === undefined) {
  throw new Error("Environment variable VITE_SUPABASE_KEY must be set!");
}

/**
 * Supabase client singleton
 */
export const client = new SupabaseClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);
