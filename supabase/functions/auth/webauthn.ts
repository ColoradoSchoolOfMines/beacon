/**
 * @file WebAuthn routes
 */

import {Context} from "oak";
import {STATUS_CODE} from "std/http/status.ts";
import {
  WEBAUTHN_RP_ID,
  WEBAUTHN_RP_NAME,
  WEBAUTHN_RP_ORIGIN,
} from "~/lib/vars.ts";
import {decodeBase64Url, encodeBase64Url} from "std/encoding/base64url.ts";
import {generateSession} from "~/lib/auth.ts";
import {generateUserClient, serviceRoleClient} from "~/lib/supabase.ts";
import {generateUsername} from "~/lib/user.ts";
import {z} from "zod";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";

/**
 * Challenge expiration time (In milliseconds)
 */
const expiresAfter = 300000;

/**
 * Supported algorithm IDs
 * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
 */
const algorithmIDs = [
  -8, // EdDSA
  -36, // ES512
  -35, // ES384
  -7, // ES256
  -259, // RS512
  -258, // RS384
  -257, // RS256
];

/**
 * Begin a WebAuthn registration
 * @param ctx Router context
 */
export const beginRegistration = async (ctx: Context) => {
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
    ctx.throw(STATUS_CODE.InternalServerError, "Failed to get profile");
  }

  if (data === null || data.length === 0) {
    ctx.throw(STATUS_CODE.BadRequest, "Missing profile");
  }

  // Generate the username
  const username = generateUsername(data[0].color, data[0].emoji);

  // Generate the registration options
  const registrationOptions = await generateRegistrationOptions({
    rpID: WEBAUTHN_RP_ID,
    rpName: WEBAUTHN_RP_NAME,
    userID: user.id,
    userName: username,
    userDisplayName: username,
    authenticatorSelection: {
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: algorithmIDs,
    timeout: 60000,
  });

  // Store the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .insert({
      type: "registration",
      challenge: registrationOptions.challenge,
    })
    .select("id")
    .single<{
      id: string;
    }>();

  if (challengeRes.error !== null || challengeRes.data === null) {
    console.error(challengeRes.error ?? "Failed to store challenge");
    ctx.throw(STATUS_CODE.InternalServerError, "Failed to store challenge");
  }

  // Return the registration options
  ctx.response.status = 200;
  ctx.response.body = {
    challengeId: challengeRes.data!.id,
    options: registrationOptions,
  };
};

/**
 * End a WebAuthn registration request body schema
 */
const endRegistrationSchema = z.object({
  challengeId: z.string(),
  response: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      attestationObject: z.string(),
      authenticatorData: z.string().optional(),
      transports: z
        .array(
          z.enum([
            "ble",
            "cable",
            "hybrid",
            "internal",
            "nfc",
            "smart-card",
            "usb",
          ]),
        )
        .optional(),
      publicKeyAlgorithm: z.number().optional(),
      publicKey: z.string().optional(),
    }),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    clientExtensionResults: z.object({
      appid: z.boolean().optional(),
      credProps: z
        .object({
          rk: z.boolean().optional(),
        })
        .optional(),
      hmacCreateSecret: z.boolean().optional(),
    }),
    type: z.enum(["public-key"]),
  }),
});

/**
 * End a WebAuthn registration
 * @param ctx Router context
 */
export const endRegistration = async (ctx: Context) => {
  // Parse and validate the request body
  const raw = await ctx.request.body().value;
  let req: z.infer<typeof endRegistrationSchema>;
  try {
    req = await endRegistrationSchema.parseAsync(raw);
  } catch (err) {
    console.error(err);
    ctx.throw(STATUS_CODE.BadRequest, err);
  }

  // Create a Supabase client for the current user
  const [_, user] = await generateUserClient(ctx, true);

  // Get the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .select("id, challenge")
    .eq("type", "registration")
    .eq("id", req.challengeId)
    .gt("created_at", new Date(Date.now() - expiresAfter).toISOString())
    .single<{
      id: string;
      challenge: string;
    }>();

  if (challengeRes.error !== null || challengeRes.data === null) {
    ctx.throw(STATUS_CODE.Forbidden, "Invalid challenge");
  }

  // Verify the registration
  let result: VerifiedRegistrationResponse | undefined = undefined;
  try {
    result = await verifyRegistrationResponse({
      response: req.response,
      expectedChallenge: challengeRes.data.challenge,
      expectedOrigin: WEBAUTHN_RP_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
      requireUserVerification: true,
      supportedAlgorithmIDs: algorithmIDs,
    });
  } catch (error) {
    console.error(error);
  }

  if (
    result === undefined ||
    result.verified === false ||
    result.registrationInfo === undefined
  ) {
    ctx.throw(STATUS_CODE.Forbidden, "Invalid registration");
  }

  // Encode the credential data
  const credentialId = req.response.id;
  const credentialPublicKeyPem = encodeBase64Url(
    result.registrationInfo.credentialPublicKey,
  );
  const counter = result.registrationInfo.counter;

  if (
    credentialId === undefined ||
    credentialPublicKeyPem === undefined ||
    counter === undefined
  ) {
    ctx.throw(STATUS_CODE.BadRequest, "Missing credential data");
  }

  // Register the credential
  const registerWebauthnCrdential = await serviceRoleClient
    .schema("auth")
    .rpc("register_webauthn_credential", {
      _user_id: user.id,
      _challenge_id: challengeRes.data.id,
      _credential_id: credentialId,
      _counter: counter,
      _public_key: credentialPublicKeyPem,
    });

  if (registerWebauthnCrdential.error !== null) {
    console.error(registerWebauthnCrdential.error);
    ctx.throw(STATUS_CODE.InternalServerError, "Failed to store credential");
  }

  ctx.response.status = 200;
};

/**
 * Begin a WebAuthn authentication
 * @param ctx Router context
 */
export const beginAuthentication = async (ctx: Context) => {
  // Generate the authentication options
  const authenticationOptions = await generateAuthenticationOptions({
    rpID: WEBAUTHN_RP_ID,
    userVerification: "preferred",
    timeout: 60000,
  });

  // Store the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .insert({
      type: "authentication",
      challenge: authenticationOptions.challenge,
    })
    .select("id")
    .single<{
      id: string;
    }>();

  if (challengeRes.error !== null || challengeRes.data === null) {
    console.error(challengeRes.error ?? "Failed to store challenge");
    ctx.throw(STATUS_CODE.InternalServerError, "Failed to store challenge");
  }

  // Return the authentication options
  ctx.response.status = 200;
  ctx.response.body = {
    challengeId: challengeRes.data.id,
    options: authenticationOptions,
  };
};

/**
 * End a WebAuthn authentication request body schema
 */
const endAuthenticationSchema = z.object({
  challengeId: z.string(),
  credentialId: z.string(),
  response: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      authenticatorData: z.string(),
      signature: z.string(),
      userHandle: z.string().optional(),
    }),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    clientExtensionResults: z.object({
      appid: z.boolean().optional(),
      credProps: z
        .object({
          rk: z.boolean().optional(),
        })
        .optional(),
      hmacCreateSecret: z.boolean().optional(),
    }),
    type: z.enum(["public-key"]),
  }),
});

/**
 * End a WebAuthn authentication
 * @param ctx Router context
 */
export const endAuthentication = async (ctx: Context) => {
  // Parse and validate the request body
  const raw = await ctx.request.body().value;
  let req: z.infer<typeof endAuthenticationSchema>;
  try {
    req = await endAuthenticationSchema.parseAsync(raw);
  } catch (err) {
    console.error(err);
    ctx.throw(STATUS_CODE.BadRequest, err);
  }

  // Get the challenge
  const challengeRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_challenges")
    .select("id, challenge")
    .eq("type", "authentication")
    .eq("id", req.challengeId)
    .gt("created_at", new Date(Date.now() - expiresAfter).toISOString())
    .single<{
      id: string;
      challenge: string;
    }>();

  const credentialRes = await serviceRoleClient
    .schema("auth")
    .from("webauthn_credentials")
    .select("id, user_id, credential_id, counter, public_key")
    .eq("credential_id", req.credentialId)
    .single<{
      id: string;
      user_id: string;
      credential_id: string;
      counter: number;
      public_key: string;
    }>();

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
    ctx.throw(STATUS_CODE.BadRequest, "Invalid challenge or credential");
  }

  // Verify the authentication
  let result: VerifiedAuthenticationResponse | undefined = undefined;
  try {
    result = await verifyAuthenticationResponse({
      authenticator: {
        counter: credentialRes.data.counter,
        credentialID: decodeBase64Url(credentialRes.data.credential_id),
        credentialPublicKey: decodeBase64Url(credentialRes.data.public_key),
      },
      expectedChallenge: challengeRes.data.challenge,
      expectedOrigin: WEBAUTHN_RP_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
      response: req.response,
    });
  } catch (error) {
    console.error(error);
  }

  if (
    result === undefined ||
    result.verified === false ||
    result.authenticationInfo === undefined
  ) {
    ctx.throw(STATUS_CODE.Forbidden, "Invalid authentication");
  }

  // Extract the result
  const newCounter = result.authenticationInfo.newCounter;

  // Authenticate the credential
  const authenticateWebauthnCrdential = await serviceRoleClient
    .schema("auth")
    .rpc("authenticate_webauthn_credential", {
      _user_id: credentialRes.data.user_id,
      _challenge_id: challengeRes.data.id,
      _credential_id: credentialRes.data.id,
      _new_counter: newCounter,
    });

  if (authenticateWebauthnCrdential.error !== null) {
    console.error(authenticateWebauthnCrdential.error);
    ctx.throw(STATUS_CODE.InternalServerError, "Failed to store credential");
  }

  // Generate a session
  const session = await generateSession(credentialRes.data.user_id, "webauthn");

  // Return the session
  ctx.response.status = 200;
  ctx.response.body = session;
};
