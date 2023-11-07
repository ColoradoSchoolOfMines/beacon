/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

import {Database} from "~/lib/schema";
import {SUPABASE_KEY, SUPABASE_URL} from "~/lib/vars";

// Validate environment variables
if (SUPABASE_URL === undefined) {
  throw new Error("Environment variable VITE_SUPABASE_URL must be set!");
}

if (SUPABASE_KEY === undefined) {
  throw new Error("Environment variable VITE_SUPABASE_KEY must be set!");
}

/**
 * Supabase client singleton
 */
export const client = new SupabaseClient<Database>(SUPABASE_URL, SUPABASE_KEY);
