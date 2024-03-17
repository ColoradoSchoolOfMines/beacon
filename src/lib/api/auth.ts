/**
 * @file Backend authentication API
 */

import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import {Session} from "@supabase/supabase-js";

import {client} from "~/lib/supabase";

/**
 * Check if passkey is supported
 * @returns Whether or not passkey is supported
 */
export const checkPasskeySupport = () =>
  navigator.credentials !== undefined &&
  window.PublicKeyCredential !== undefined;

/**
 * Begin a WebAuthn registration response
 * @param T Whether or not the request was successful
 */
interface beginRegistrationResponse<T extends boolean> {
  /**
   * Challenge ID
   */
  challengeId: T extends true ? string : undefined;

  /**
   * Credential creation options
   */
  options: T extends true ? PublicKeyCredentialCreationOptionsJSON : undefined;

  /**
   * Whether or not the request was successful
   */
  ok: T;
}

/**
 * Begin a WebAuthn registration
 * @returns Challenge ID, credential creation options, and whether or not the request was successful
 */
export const beginRegistration = async (): Promise<
  beginRegistrationResponse<boolean>
> => {
  // Make the request
  const {data, error} = await client.functions.invoke<{
    challengeId: string;
    options: PublicKeyCredentialCreationOptionsJSON;
  }>("auth/webauthn/registration/begin", {method: "POST"});

  // Handle error
  if (data === null || error !== null) {
    return {
      challengeId: undefined,
      options: undefined,
      ok: false,
    } as beginRegistrationResponse<false>;
  }

  return {
    challengeId: data.challengeId,
    options: data.options,
    ok: true,
  } as beginRegistrationResponse<true>;
};

/**
 * End a WebAuthn registration
 * @param challengeId Challenge ID
 * @param response Registration response
 * @returns Whether or not the registration was successful
 */
export const endRegistration = async (
  challengeId: string,
  response: RegistrationResponseJSON,
) => {
  // Make the request
  const {error} = await client.functions.invoke<never>(
    "auth/webauthn/registration/end",
    {
      method: "POST",
      body: {
        challengeId,
        response,
      },
    },
  );

  return error === null;
};

/**
 * Begin a WebAuthn authentication response
 * @param T Whether or not the request was successful
 */
interface beginAuthenticationResponse<T extends boolean> {
  /**
   * Challenge ID
   */
  challengeId: T extends true ? string : undefined;

  /**
   * Credential request options
   */
  options: T extends true ? PublicKeyCredentialRequestOptionsJSON : undefined;

  /**
   * Whether or not the request was successful
   */
  ok: T;
}

/**
 * Begin a WebAuthn authentication
 * @returns Challenge ID, credential request options, and whether or not the request was successful
 */
export const beginAuthentication = async (): Promise<
  beginAuthenticationResponse<boolean>
> => {
  // Make the request
  const {data, error} = await client.functions.invoke<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptionsJSON;
  }>("auth/webauthn/authentication/begin", {method: "POST"});

  // Handle error
  if (data === null || error !== null) {
    return {
      challengeId: undefined,
      options: undefined,
      ok: false,
    } as beginAuthenticationResponse<false>;
  }

  return {
    challengeId: data.challengeId,
    options: data.options,
    ok: true,
  } as beginAuthenticationResponse<true>;
};

/**
 * End a WebAuthn authentication response
 * @param T Whether or not the request was successful
 */
interface endAuthenticationResponse<T extends boolean> {
  /**
   * Session
   */
  session: T extends true ? Session : undefined;

  /**
   * Whether or not the request was successful
   */
  ok: T;
}

/**
 * End a WebAuthn authentication
 * @param challengeId Challenge ID
 * @param clientCredentialId Client credential ID
 * @param response Authentication response
 * @returns Session and whether or not the request was successful
 */
export const endAuthentication = async (
  challengeId: string,
  clientCredentialId: string,
  response: AuthenticationResponseJSON,
): Promise<endAuthenticationResponse<boolean>> => {
  // Make the request
  const {data, error} = await client.functions.invoke<Session>(
    "auth/webauthn/authentication/end",
    {
      method: "POST",
      body: {
        challengeId,
        clientCredentialId,
        response,
      },
    },
  );

  // Handle error
  if (data === null || error !== null) {
    return {
      session: undefined,
      ok: false,
    } as endAuthenticationResponse<false>;
  }

  return {
    session: data,
    ok: true,
  } as endAuthenticationResponse<true>;
};
