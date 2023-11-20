/**
 * @file WebAuthn routes
 */

import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { dbClient } from "../lib/client.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Generate a WebAuthn challenge
 * @param ctx Router context
 */
export const generateChallenge = async (ctx: Context) => {
  // Generate a challenge
  const {rows} = await dbClient.queryObject<{
    id: string,
    challenge: string,
  }>("INSERT INTO auth.webauthn_challenges DEFAULT VALUES RETURNING id, challenge;");

  // Return the challenge
  ctx.response.body = {
    id: rows[0].id,
    challenge: rows[0].challenge,
  };
};

const verifyChallengeSchema = z.object({
  id: z.string().uuid(),

});

/**
 * Verify a WebAuthn challenge and log the user in
 * @param ctx Router context
 */
export const verifyChallenge = async (ctx: Context) => {
  // Get the request body
  if (!ctx.request.hasBody) {
    ctx.throw(415, "Request body is required");
  }

  const body = await ctx.request.body().value;

  // Get the challenge
  const {rows} =  await dbClient.queryObject<{
    id: string,
    challenge: string,
  }>("SELECT id, challenge FROM auth.webauthn_challenges WHERE id = $1;", [
    body.id
  ]);
};
