/**
 * @file WebAuthn routes
 */

import {Context} from "oak";
import {generateUserClient, serviceRoleClient} from "~/lib/supabase.ts";
import {fido2, rpId} from "~/lib/webauthn.ts";
import {generateSession} from "~/lib/auth.ts";
import {generateUsername} from "~/lib/user.ts";
import {z} from "zod";

/**
 * UTF-8 text decoder
 */
const textDecoder = new TextDecoder();

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
  const [userClient, user] = await generateUserClient(ctx, true);

  // Get profile information
  const {data, error} = await userClient
    .from("profiles")
    .select("color, emoji")
    .eq("id", user.id)
    .limit(1);

  if (error) {
    console.error(error);
    ctx.throw(500, "Failed to get profile");
  }

  if (data === null || data.length === 0) {
    ctx.throw(400, "Missing profile");
  }

  // Generate the attestation options
  const attestationOptions = await fido2.attestationOptions();
  const encodedChallenge = textDecoder.decode(attestationOptions.challenge);

  // Store the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .insert({
      type: "assertion",
      challenge: encodedChallenge,
    })
    .select("id")
    .single();

  if (challengeRes.error !== null || challengeRes.data === null) {
    console.error(challengeRes.error ?? "Failed to store challenge");
    ctx.throw(500, "Failed to store challenge");
  }

  // Generate the username
  const username = generateUsername(data[0].color, data[0].emoji);

  // Return the attestation options
  ctx.response.status = 200;
  ctx.response.body = {
    challengeId: challengeRes.data.id,
    options: {
      ...attestationOptions,
      challenge: encodedChallenge,
      user: {
        id: user.id,
        name: username,
        displayName: username,
      },
    },
  };
};

/**
 * End a WebAuthn attestation request body schema
 */
const endAttestationSchema = z.object({
  challengeId: z.string(),
  credentialId: z.string(),
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
  // Parse and validate the request body
  const raw = await ctx.request.body().value;
  let req: z.infer<typeof endAttestationSchema>;
  try {
    req = await endAttestationSchema.parseAsync(raw);
  } catch (err) {
    console.error(err);
    ctx.throw(400, err);
  }

  // Create a Supabase client for the current user
  const [_, user] = await generateUserClient(ctx, true);

  // Get the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .select("id, challenge")
    .eq("type", "attestation")
    .eq("id", req.challengeId)
    .single();

  if (challengeRes.error !== null || challengeRes.data === null) {
    ctx.throw(401, "Invalid challenge");
  }

  // Verify the attestation
  const result = await fido2.attestationResult(
    {
      rawId: textEncoder.encode(req.credentialId),
      response: {
        attestationObject: req.response.attestationObject,
        clientDataJSON: req.response.clientDataJSON,
      },
    },
    {
      challenge: challengeRes.data.challenge,
      origin: `https://${rpId}`,
      factor: "either",
      rpId,
    },
  );

  // Get the credential counter, raw ID, and public key
  const credentialId = result.clientData.get("rawId");
  const counter = result.authnrData.get("counter");
  const credentialPublicKeyPem = result.authnrData.get(
    "credentialPublicKeyPem",
  );

  if (
    counter === undefined ||
    credentialId === undefined ||
    credentialPublicKeyPem === undefined
  ) {
    ctx.throw(400, "Missing credential data");
  }

  // Attest the credential
  const attestWebauthnCrdential = await serviceRoleClient
    .schema("auth")
    .rpc("attest_webauthn_credential", {
      _user_id: user.id,
      _challenge_id: challengeRes.data.id,
      _credential_id: credentialId,
      _counter: counter,
      _public_key: credentialPublicKeyPem,
    });

  if (attestWebauthnCrdential.error !== null) {
    console.error(attestWebauthnCrdential.error);
    ctx.throw(500, "Failed to store credential");
  }

  ctx.response.status = 200;
};

/**
 * Begin a WebAuthn assertion
 * @param ctx Router context
 */
export const beginAssertion = async (ctx: Context) => {
  // Generate the assertion options
  const assertionOptions = await fido2.assertionOptions();
  const encodedChallenge = textDecoder.decode(assertionOptions.challenge);

  // Store the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .insert({
      type: "assertion",
      challenge: encodedChallenge,
    })
    .select("id")
    .single();

  if (challengeRes.error !== null || challengeRes.data === null) {
    console.error(challengeRes.error ?? "Failed to store challenge");
    ctx.throw(500, "Failed to store challenge");
  }

  // Return the assertion options
  ctx.response.status = 200;
  ctx.response.body = {
    ...assertionOptions,
    challengeId: challengeRes.data.id,
    challenge: encodedChallenge,
  };
};

/**
 * End a WebAuthn assertion request body schema
 */
const endAssertionSchema = z.object({
  challengeId: z.string(),
  credentialId: z.string(),
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
  const raw = await ctx.request.body().value;
  let req: z.infer<typeof endAssertionSchema>;
  try {
    req = await endAssertionSchema.parseAsync(raw);
  } catch (err) {
    console.error(err);
    ctx.throw(400, err);
  }

  // Get the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .select("id, challenge")
    .eq("type", "assertion")
    .eq("id", req.challengeId)
    .single();

  const credentialRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_credentials")
    .select("id, user_id, counter, public_key")
    .eq("user_id", req.credentialId)
    .single();

  if (
    challengeRes.error !== null ||
    challengeRes.data === null ||
    credentialRes.error !== null ||
    credentialRes.data === null
  ) {
    console.error(
      challengeRes.error ??
        credentialRes.error ??
        "Failed to get challenge or credential",
    );
    ctx.throw(400, "Invalid challenge or credential");
  }

  // Verify the assertion
  await fido2.assertionResult(
    {
      rawId: textEncoder.encode(req.credentialId),
      response: {
        authenticatorData: textEncoder.encode(req.response.authenticatorData),
        clientDataJSON: req.response.clientDataJSON,
        signature: req.response.signature,
      },
    },
    {
      challenge: challengeRes.data.challenge,
      factor: "either",
      origin: `https://${rpId}`,
      prevCounter: credentialRes.data.counter,
      publicKey: credentialRes.data.public_key,
      rpId,
      userHandle: null,
    },
  );

  // Assert the credential
  const assertWebauthnCrdential = await serviceRoleClient
    .schema("auth")
    .rpc("assert_webauthn_credential", {
      _user_id: credentialRes.data.user_id,
      _challenge_id: challengeRes.data.id,
      _credential_id: credentialRes.data.id,
    });

  if (assertWebauthnCrdential.error !== null) {
    console.error(assertWebauthnCrdential.error);
    ctx.throw(500, "Failed to store credential");
  }

  // Generate a session
  const session = await generateSession(req.credentialId, "webauthn");

  // Return the session
  ctx.response.status = 200;
  ctx.response.body = {
    session,
  };
};
