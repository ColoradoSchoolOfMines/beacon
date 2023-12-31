/**
 * @file Supabase clients
 */

import {Context} from "oak";
import {Database} from "~/lib/schema.ts";
import {SupabaseClient, User} from "@supabase/supabase-js";
import {STATUS_CODE} from "std/http/status.ts";
import {
  X_SUPABASE_ANON_KEY,
  X_SUPABASE_SERVICE_ROLE_KEY,
  X_SUPABASE_URL,
} from "~/lib/vars.ts";

/**
 * Generate a Supabase client for the current user
 * @param T Whether or not the user must be authenticated
 * @param ctx Router context
 * @param requireAuth Require the user to already be authenticated
 * @returns Supabase user-role client
 */
export const generateUserClient = async <T extends boolean>(
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
      ctx.throw(STATUS_CODE.BadRequest, "Authorization header is required");
    } else {
      // deno-lint-ignore no-explicit-any
      return [undefined, undefined] as any;
    }
  }

  // Create the client
  const client = new SupabaseClient<Database>(
    X_SUPABASE_URL,
    X_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    },
  );

  // Get the user
  const {data, error} = await client.auth.getUser();

  if (error !== null) {
    ctx.throw(STATUS_CODE.InternalServerError, error.message);
  }

  if (data === null) {
    if (requireAuth) {
      ctx.throw(STATUS_CODE.Unauthorized, "Authorization header is invalid");
    } else {
      // deno-lint-ignore no-explicit-any
      return [undefined, undefined] as any;
    }
  }

  // deno-lint-ignore no-explicit-any
  return [client, data.user] as any;
};

/**
 * Supabase service role client singleton
 *
 * **!!!WARNING!!! This client bypasses all security policies !!!WARNING!!!**
 */
export const serviceRoleClient = new SupabaseClient<Database>(
  X_SUPABASE_URL,
  X_SUPABASE_SERVICE_ROLE_KEY,
);
