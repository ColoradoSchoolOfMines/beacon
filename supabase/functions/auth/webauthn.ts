/**
 * @file WebAuthn routes
 */

import {Context} from "oak";
import {createUserClient, dbClient} from "../lib/supabase.ts";
import {decodeBase64, encodeBase64} from "std/encoding/base64.ts";
import {fido2, rpId} from "../lib/webauthn.ts";
import {generateSession} from "~/lib/auth.ts";
import {generateUsername} from "~/lib/user.ts";
import {z} from "zod";

/**
 * UTF-8 text encoder
 */
const textEncoder = new TextEncoder();

/**
 * Begin a WebAuthn attestation
 * @param ctx Router context
 */
export const beginAttestation = async (ctx: Context) => {
  // Create a Supabase client for the current user
  const [userClient, user] = await createUserClient(ctx, true);

  // Get profile information
  const {data, error} = await userClient
    .from("profiles")
    .select("color, emoji")
    .eq("id", user.id)
    .limit(1);

  if (error) {
    ctx.throw(500, error.message);
  }

  if (data === null || data.length === 0) {
    ctx.throw(400, "Missing profile");
  }

  // Generate the attestation options
  const attestationOptions = await fido2.attestationOptions();
  const encodedChallenge = encodeBase64(attestationOptions.challenge);

  // Store the challenge
  const {rows} = await dbClient<{
    id: string;
  }>`INSERT INTO auth.webauthn_challenges ${dbClient(
    {
      type: "attestation",
      challenge: encodedChallenge,
    },
    "type",
    "challenge",
  )} RETURNING id;`;

  if (rows.length === 0) {
    ctx.throw(500, "Failed to store challenge");
  }

  // Generate the username
  const username = generateUsername(data[0].color, data[0].emoji);

  // Return the attestation options
  ctx.response.body = {
    ...attestationOptions,
    user: {
      id: user.id,
      name: username,
      displayName: username,
    },
    challengeId: rows[0].id,
    challenge: encodedChallenge,
  };
};

/**
 * End a WebAuthn attestation request body schema
 */
const endAttestationSchema = z.object({
  challengeId: z.string(),
  rawId: z.string(),
  response: z.object({
    attestationObject: z.string(),
    clientDataJSON: z.string(),
  }),
});

/**
 * End a WebAuthn attestation
 * @param ctx Router context
 */
export const endAttestation = async (ctx: Context) => {
  // Create a Supabase client for the current user
  const [_, user] = await createUserClient(ctx, true);

  // Parse and validate the request body
  const req = await endAttestationSchema.parseAsync(ctx.request.body());

  // Get the challenge
  const {rows} = await dbClient<{
    id: string;
    challenge: string;
  }>`SELECT id, challenge FROM auth.webauthn_challenges WHERE type = 'attestation'::auth.webauthn_challenge_type AND id = ${req.challengeId};`;

  if (rows.length === 0) {
    ctx.throw(400, "Invalid challenge");
  }

  // Verify the attestation
  const result = await fido2.attestationResult(
    {
      rawId: textEncoder.encode(req.rawId),
      response: {
        attestationObject: req.response.attestationObject,
        clientDataJSON: req.response.clientDataJSON,
      },
    },
    {
      challenge: rows[0].challenge,
      origin: `https://${rpId}`,
      factor: "either",
      rpId,
    },
  );

  // Get the credential counter, raw ID, and public key
  const rawId = result.clientData.get("rawId");
  const counter = result.authnrData.get("counter");
  const credentialPublicKeyPem = result.authnrData.get(
    "credentialPublicKeyPem",
  );

  if (
    counter === undefined ||
    rawId === undefined ||
    credentialPublicKeyPem === undefined
  ) {
    ctx.throw(400, "Missing credential data");
  }

  // Delete the challenge and store the credential
  const transaction = await dbClient.createTransaction(
    "add_webauthn_credential",
  );
  await transaction.begin(async sql => [
    // Store the credential
    await transaction`INSERT INTO auth.webauthn_credentials ${transaction(
      {
        user_id: user.id,
        credential_id: rawId,
        counter,
        public_key: credentialPublicKeyPem,
      },
      "user_id",
      "credential_id",
      "counter",
      "public_key",
    )}`,

    // Delete the challenge
    await transaction`DELETE FROM auth.webauthn_challenges WHERE id = ${rows[0].id};`,
  ]);
  await transaction.commit();
};

/**
 * Begin a WebAuthn assertion
 * @param ctx Router context
 */
export const beginAssertion = async (ctx: Context) => {
  // Generate the assertion options
  const assertionOptions = await fido2.assertionOptions();
  const encodedChallenge = encodeBase64(assertionOptions.challenge);

  // Store the challenge
  const {rows} = await dbClient<{
    id: string;
  }>`INSERT INTO auth.webauthn_challenges ${dbClient(
    {
      type: "assertion",
      challenge: encodedChallenge,
    },
    "type",
    "challenge",
  )} RETURNING id;`;

  if (rows.length === 0) {
    ctx.throw(500, "Failed to store challenge");
  }

  // Return the assertion options
  ctx.response.body = {
    ...assertionOptions,
    challengeId: rows[0].id,
    challenge: encodedChallenge,
  };
};

/**
 * End a WebAuthn assertion request body schema
 */
const endAssertionSchema = z.object({
  challengeId: z.string(),
  rawId: z.string(),
  response: z.object({
    authenticatorData: z.string(),
    clientDataJSON: z.string(),
    signature: z.string(),
  }),
});

/**
 * End a WebAuthn assertion
 * @param ctx Router context
 */
export const endAssertion = async (ctx: Context) => {
  // Parse and validate the request body
  const req = await endAssertionSchema.parseAsync(ctx.request.body());

  // Get the challenge
  const {rows: challengeRows} = await dbClient<{
    id: string;
    challenge: string;
  }>`SELECT id, challenge FROM auth.webauthn_challenges WHERE type = 'assertion'::auth.webauthn_challenge_type AND id = ${req.challengeId};`;

  if (challengeRows.length === 0) {
    ctx.throw(400, "Missing challenge");
  }

  // Get the credential
  const {rows: credentialRows} = await dbClient<{
    counter: number;
    public_key: string;
  }>`SELECT counter, public_key FROM auth.webauthn_credentials WHERE user_id = ${req.rawId};`;

  if (credentialRows.length === 0) {
    ctx.throw(400, "Missing credential");
  }

  // Verify the assertion
  await fido2.assertionResult(
    {
      rawId: textEncoder.encode(req.rawId),
      response: {
        authenticatorData: textEncoder.encode(req.response.authenticatorData),
        clientDataJSON: req.response.clientDataJSON,
        signature: req.response.signature,
      },
    },
    {
      challenge: challengeRows[0].challenge,
      factor: "either",
      origin: `https://${rpId}`,
      prevCounter: credentialRows[0].counter,
      publicKey: credentialRows[0].public_key,
      rpId,
      userHandle: null,
    },
  );

  // Delete the challenge and update the credential counter
  const transaction = await dbClient.createTransaction(
    "use_webauthn_credential",
  );
  await transaction.begin(async sql => [
    // Delete the challenge
    await sql`DELETE FROM auth.webauthn_challenges WHERE id = ${req.challengeId};`,

    // Update the credential counter
    await sql`UPDATE auth.webauthn_credentials SET counter = counter + 1 WHERE user_id = ${req.rawId};`,
  ]);
  await transaction.commit();

  // Generate a session
  const session = await generateSession(req.rawId);

  // Return the session
  ctx.response.body = {
    session,
  };
};
