/**
 * @file Auth helpers
 */

import {Fido2Lib} from "fido2";

/**
 * FIDO2 library instance
 */
export const fido2 = new Fido2Lib({
  timeout: 60000,
  rpId: "beacon.social",
  rpName: "Beacon Social Network",
  challengeSize: 64,
  authenticatorSelection: {
    residentKey: "required",
    userVerification: "preferred",
    requireResidentKey: true,
  },
  authenticatorRequireResidentKey: true,
  authenticatorUserVerification: "preferred",
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
