/**
 * @file WebAuthn routes
 */

import {Context} from "oak";
import {createUserClient, dbClient} from "~/lib/client.ts";
import {z} from "zod";
import {f2l} from "~/lib/auth.ts";

export const registerCredential = async (ctx: Context) => {
  // Create a Supabase client for the current user
  const [_, user] = await createUserClient(ctx, true);

  // Generate the attestation options
  const attestationOptions = await f2l.attestationOptions();
  (attestationOptions.user as Record<string, any>).id = user.id;

  // Store the attestation
  await dbClient.queryObject(
    "INSERT INTO auth.webauthn_attestations (user_id, options) VALUES ($1, $2);",
    [user.id, attestationOptions],
  );

  // ctx.request.headers.
};

/**
 * Generate a WebAuthn challenge
 * @param ctx Router context
 */
export const generateChallenge = async (ctx: Context) => {
  const {rows} = await dbClient.queryObject<{
    id: string;
    challenge: string;
  }>(
    "INSERT INTO auth.webauthn_challenges DEFAULT VALUES RETURNING id, challenge;",
  );

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
  const {rows} = await dbClient.queryObject<{
    id: string;
    challenge: string;
  }>("SELECT id, challenge FROM auth.webauthn_challenges WHERE id = $1;", [
    body.id,
  ]);
};
