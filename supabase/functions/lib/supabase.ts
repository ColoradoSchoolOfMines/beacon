/**
 * @file Supabase clients
 */

import {Client} from "postgres";
import {Context} from "oak";
import {Database} from "~/lib/schema.ts";
import {SupabaseClient, User} from "@supabase/supabase-js";
import {SUPABASE_ANON_KEY, SUPABASE_DB_URL, SUPABASE_URL} from "~/lib/vars.ts";

/**
 * Create a Supabase client for the current user
 * @param T Whether or not the user must be authenticated
 * @param ctx Router context
 * @param requireAuth Require the user to already be authenticated
 * @returns Supabase user-role client
 */
export const createUserClient = async <T extends boolean>(
  ctx: Context,
  requireAuth: T,
): Promise<
  T extends true
    ? [SupabaseClient<Database>, User]
    : [SupabaseClient<Database> | undefined, User | undefined]
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
    ctx.throw(error.status ?? 500, error.message);
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
 * Supabase database client singleton
 */
const dbClient = new Client(SUPABASE_DB_URL);
await dbClient.connect();

export {dbClient};
