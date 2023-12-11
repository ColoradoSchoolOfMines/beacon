/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

import {Database} from "~/lib/schema";
import {SUPABASE_ANON_KEY, SUPABASE_URL} from "~/lib/vars";

/**
 * Supabase client singleton
 */
export const client = new SupabaseClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
