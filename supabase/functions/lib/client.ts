/**
 * @file Supabase clients
 */

import {SupabaseClient} from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {Client} from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import {Database} from "../../../src/lib/schema.ts";

const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validate environment variables
if (SUPABASE_DB_URL === undefined) {
  throw new Error("Environment variable SUPABASE_DB_URL must be set!");
}

if (SUPABASE_URL === undefined) {
  throw new Error("Environment variable SUPABASE_URL must be set!");
}

if (SUPABASE_SERVICE_ROLE_KEY === undefined) {
  throw new Error("Environment variable SUPABASE_SERVICE_ROLE_KEY must be set!");
}

/**
 * Supabase service-role client singleton
 *
 * **!!! This client uses the service role key, which bypasses all row-level security policies !!!**
 */
const serviceClient = new SupabaseClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Supabase database client singleton
 */
const dbClient = new Client(SUPABASE_DB_URL);
await dbClient.connect();

export {
  serviceClient,
  dbClient,
};
