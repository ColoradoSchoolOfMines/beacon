/**
 * @file Backend authentication API
 */

import {Session} from "@supabase/supabase-js";

import {client} from "~/lib/supabase";

/**
 * UTF-8 text decoder
 */
const textDecoder = new TextDecoder();

/**
 * UTF-8 text encoder
 */
const textEncoder = new TextEncoder();

/**
 * Begin a WebAuthn attestation response
 * @param T Whether or not the request was successful
 */
type beginAttestationResponse<T extends boolean> = [
  T extends true ? string : undefined,
  T extends true ? PublicKeyCredentialCreationOptions : undefined,
  T,
];

/**
 * Begin a WebAuthn attestation
 * @returns Challenge ID, credential creation options, and whether or not the request was successful
 */
export const beginAttestation = async (): Promise<
  beginAttestationResponse<boolean>
> => {
  // Make the request
  const {data, error} = await client.functions.invoke<{
    challengeId: string;
    options: PublicKeyCredentialCreationOptions & {
      challenge: string;
      user: {
        id: string;
        name: string;
        displayName: string;
      };
    };
  }>("auth/webauthn/attestate/begin", {method: "POST"});

  // Handle error
  if (data === null || error !== null) {
    return [
      undefined,
      undefined,
      false,
    ] as beginAttestationResponse<false>;
  }

  return [
    data.challengeId,
    {
      ...data.options,
      challenge: textEncoder.encode(data.options.challenge).buffer,
      user: {
        ...data.options.user,
        id: textEncoder.encode(data.options.user.id).buffer,
      },
    },
    true,
  ] as beginAttestationResponse<true>;
};

/**
 * End a WebAuthn attestation
 * @param challengeId Challenge ID
 * @param credentialID Credential ID
 * @param response Attestation response
 * @returns Whether or not the attestation was successful
 */
export const endAttestation = async (
  challengeId: string,
  credentialID: string,
  response: {
    attestationObject: ArrayBufferLike;
    clientDataJSON: ArrayBufferLike;
  },
) => {
  // Make the request
  const {error} = await client.functions.invoke<never>(
    "auth/webauthn/attestate/end",
    {
      method: "POST",
      body: {
        challengeId,
        credentialID,
        response: {
          attestationObject: textDecoder.decode(response.attestationObject),
          clientDataJSON: textDecoder.decode(response.clientDataJSON),
        },
      },
    },
  );

  return error === null;
};

/**
 * Begin a WebAuthn assertion response
 * @param T Whether or not the request was successful
 */
type beginAssertionResponse<T extends boolean> = [
  T extends true ? PublicKeyCredentialRequestOptions : undefined,
  T,
];

/**
 * Begin a WebAuthn assertion
 * @returns Credential request options
 */
export const beginAssertion = async (): Promise<
  beginAssertionResponse<boolean>
> => {
  // Make the request
  const {data, error} =
    await client.functions.invoke<PublicKeyCredentialRequestOptions>(
      "auth/webauthn/assertion/begin",
      {method: "POST"},
    );

  // Handle error
  if (data === null || error !== null) {
    return [undefined, false] as beginAssertionResponse<false>;
  }

  return [data, true] as beginAssertionResponse<true>;
};

/**
 * End a WebAuthn assertion response
 * @param T Whether or not the request was successful
 */
type endAssertionResponse<T extends boolean> = [
  T extends true ? Session : undefined,
  T,
];

/**
 * End a WebAuthn assertion
 * @param challengeId Challenge ID
 * @param credentialId Credential ID
 * @param response Assertion response
 * @returns Whether or not the assertion was successful
 */
export const endAssertion = async (
  challengeId: string,
  credentialId: string,
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  },
): Promise<endAssertionResponse<boolean>> => {
  // Make the request
  const {data, error} = await client.functions.invoke<Session>(
    "auth/webauthn/assertion/end",
    {
      method: "POST",
      body: {
        challengeId,
        credentialId,
        response,
      },
    },
  );

  // Handle error
  if (data === null || error !== null) {
    return [undefined, false] as endAssertionResponse<false>;
  }

  return [data, true] as endAssertionResponse<true>;
};
