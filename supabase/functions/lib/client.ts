/**
 * @file Supabase clients
 */

import {Client} from "postgres";
import {Context} from "oak";
import {Database} from "~/lib/schema.ts";
import {SupabaseClient, User} from "@supabase/supabase-js";

const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validate environment variables
if (SUPABASE_DB_URL === undefined) {
  throw new Error("Environment variable SUPABASE_DB_URL must be set!");
}

if (SUPABASE_URL === undefined) {
  throw new Error("Environment variable SUPABASE_URL must be set!");
}

if (SUPABASE_ANON_KEY === undefined) {
  throw new Error("Environment variable SUPABASE_ANON_KEY must be set!");
}

if (SUPABASE_SERVICE_ROLE_KEY === undefined) {
  throw new Error(
    "Environment variable SUPABASE_SERVICE_ROLE_KEY must be set!",
  );
}

/**
 * Create a Supabase client for the current user
 * @param T Whether or not the user must be authenticated
 * @param ctx Router context
 * @param requireAuth Require the user to already be authenticated
 * @returns Supabase user-role client
 */
const createUserClient = async <T extends boolean>(
  ctx: Context,
  requireAuth: T,
): Promise<
  [SupabaseClient<Database> | undefined, T extends true ? User : undefined]
> => {
  // Get the authorization header
  const authorization = ctx.request.headers.get("Authorization");
  if (authorization === null) {
    if (requireAuth) {
      ctx.throw(401, "Authorization header is required");
    } else {
      return [undefined, undefined] as any;
    }
  }

  // Create the client
  const client = new SupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  // Get the user
  const {data, error} = await client.auth.getUser();

  if (error !== null) {
    ctx.throw(500, error.message);
  }

  if (data === null) {
    if (requireAuth) {
      ctx.throw(401, "Authorization header is invalid");
    } else {
      return [undefined, undefined] as any;
    }
  }

  return [client, data.user] as any;
};

/**
 * Supabase service-role client singleton
 *
 * !!!WARNING!!! This client uses the service role key, which bypasses all row-level security policies !!!WARNING!!!
 */
const serviceClient = new SupabaseClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Supabase database client singleton
 */
const dbClient = new Client(SUPABASE_DB_URL);
await dbClient.connect();

export {createUserClient, serviceClient, dbClient};
