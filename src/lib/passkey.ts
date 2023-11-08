/**
 * @file Passkey helper
 */

/**
 * Relaying party entity
 */
const rp: PublicKeyCredentialRpEntity = {
  id: document.location.hostname,
  name: "Beacon Social Network",
};

/**
 * Timeout for passkey operations
 */
const timeout = 60000;

/**
 * User verification requirement
 */
const userVerification: UserVerificationRequirement = "required";

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
  await navigator.credentials.create({
    publicKey: {
      challenge: new Uint8Array(challenge),
      user: {
        id: new TextEncoder().encode(userId),
        name: userId,
        displayName: `Beacon User ${userId}`,
      },
      authenticatorSelection: {
        residentKey: "required",
        userVerification,
      },
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
      rp,
      timeout,
    },
  });

/**
 * Get a passkey
 * @param challenge Passkey challenge
 * @returns Passkey
 */
export const getPasskey = async (
  challenge: ArrayLike<number> | ArrayBufferLike,
) =>
  await navigator.credentials.get({
    mediation: "conditional",
    publicKey: {
      challenge: new Uint8Array(challenge),
      rpId: rp.id,
      timeout,
      userVerification,
    },
  });
