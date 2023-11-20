/**
 * @file Auth helpers
 */

import {OTPCredential} from "~/lib/types";

/**
 * Authetication action timeout (in milliseconds)
 */
const timeout = 60000;

/**
 * Passkey relaying party entity
 */
const passkeyRp: PublicKeyCredentialRpEntity = {
  id: document.location.hostname,
  name: "Beacon Social Network",
};

/**
 * Check if passkey is supported
 * @returns Whether or not passkey is supported
 */
export const checkPasskeySupport = () =>
  navigator.credentials !== undefined &&
  window.PublicKeyCredential !== undefined;

/**
 * Create a passkey
 * @param challenge Passkey challenge
 * @param userId Passkey user ID
 * @returns Passkey
 */
export const createPasskey = async (
  challenge: ArrayLike<number> | ArrayBufferLike,
  userId: string,
) =>
  (await navigator.credentials.create({
    publicKey: {
      attestation: "none",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
        requireResidentKey: true,
      },
      challenge: new Uint8Array(challenge),
      pubKeyCredParams: [
        {
          alg: -8, // EdDSA
          type: "public-key",
        },
        {
          alg: -36, // ES512
          type: "public-key",
        },
        {
          alg: -35, // ES384
          type: "public-key",
        },
        {
          alg: -7, // ES256
          type: "public-key",
        },
        {
          alg: -259, // RS512
          type: "public-key",
        },
        {
          alg: -258, // RS384
          type: "public-key",
        },
        {
          alg: -257, // RS256
          type: "public-key",
        },
      ],
      rp: passkeyRp,
      timeout,
      user: {
        id: new TextEncoder().encode(userId),
        name: userId,
        displayName: `Beacon User ${userId}`,
      },
    },
  })) ?? undefined;

/**
 * Get a passkey
 * @param challenge Passkey challenge
 * @returns Passkey
 */
export const getPasskey = async (
  challenge: ArrayLike<number> | ArrayBufferLike,
) =>
  (await navigator.credentials.get({
    mediation: "optional",
    publicKey: {
      challenge: new Uint8Array(challenge),
      rpId: passkeyRp.id,
      timeout,
      userVerification: "preferred",
    },
  })) ?? undefined;

/**
 * Check if OTP is supported
 * @returns Whether or not OTP is supported
 */
export const checkOtpSupport = () =>
  navigator.credentials !== undefined &&
  (window as Record<string, any>).OTPCredential !== undefined;

/**
 * Get an OTP
 * @returns OTP
 */
export const getOtp = async () =>
  (
    (await navigator.credentials.get({
      mediation: "optional",
      otp: {
        transport: [
          "sms",
        ],
      },
      signal: AbortSignal.timeout(timeout),
    } as CredentialRequestOptions)) as OTPCredential | null
  )?.code ?? undefined;
