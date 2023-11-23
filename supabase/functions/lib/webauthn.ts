/**
 * @file Webauthn utilities
 */

import {Fido2Lib} from "fido2-lib";

/**
 * Relaying party ID
 */
export const rpId = "beacon.social";

/**
 * FIDO2 library instance
 */
export const fido2 = new Fido2Lib({
  authenticatorRequireResidentKey: true,
  authenticatorUserVerification: "preferred",
  challengeSize: 64,
  rpId,
  rpName: "Beacon Social Network",
  timeout: 60000,
  cryptoParams: [
    -8, // EdDSA
    -36, // ES512
    -35, // ES384
    -7, // ES256
    -259, // RS512
    -258, // RS384
    -257, // RS256
  ],
});
