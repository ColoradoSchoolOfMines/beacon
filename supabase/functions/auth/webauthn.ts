/**
 * @file WebAuthn routes
 */

import {Context} from "oak";
import {createUserClient, dbClient} from "~/lib/client.ts";
import {encodeBase64, decodeBase64} from "std/encoding/base64.ts";
import {fido2} from "~/lib/auth.ts";
import {generateUsername} from "~/lib/user.ts";
import {z} from "zod";

/**
 * WebAuthn attestation options
 */
interface AttestationOptions {
  challenge: ArrayBuffer;
  user: object;
  rp: object;
}

/**
 * Begin a WebAuthn attestation
 * @param ctx Router context
 */
export const beginAttestation = async (ctx: Context) => {
  // Create a Supabase client for the current user
  const [userClient, user] = await createUserClient(ctx, true);

  // Get profile information
  const {data, error} = await userClient.from("profiles").select("*").limit(1);

  if (error) {
    ctx.throw(500, error.message);
  }

  // Generate the username
  const username = generateUsername(data[0].color, data[0].emoji);

  // Generate the attestation options
  const attestationOptions =
    (await fido2.attestationOptions()) as unknown as AttestationOptions;
  attestationOptions.user = {
    id: user.id,
    name: username,
    displayName: username,
  };

  const encodedChallenge = encodeBase64(attestationOptions.challenge);

  // Store the challenge
  await dbClient.queryObject(
    "INSERT INTO auth.webauthn_challenges (user_id, type, challenge) VALUES ($1, $2, $3);",
    [
      user.id,
      "attestation",
      encodedChallenge,
    ],
  );

  // Return the attestation options
  ctx.response.body = {
    ...attestationOptions,
    challenge: encodedChallenge,
  };
};

const endAttestationSchema = z.object({
  authenticatorAttachment: z.string().optional(),
  rawId: z.string(),
  response: z.object({
    attestationObject: z.string(),
    clientData: z.string(),
  }),
});

/**
 * End a WebAuthn attestation
 * @param ctx Router context
 */
export const endAttestation = async (ctx: Context) => {
  // Parse and validate the request body
  const req = await endAttestationSchema.parseAsync(ctx.request.body());
  const result = await fido2.attestationResult();
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
