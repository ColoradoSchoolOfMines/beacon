/**
 * @file Auth helpers
 */

import {Fido2Lib} from "fido2-lib";
import {JWTPayload} from "jose";

/**
 * Supabase session claims
 *
 * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/api/token.go#L22
 * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/models/sessions.go#L38
 */
interface SupabaseSessionClaims extends JWTPayload {
  /**
   * Email
   */
  email: string;

  /**
   * Phone number
   */
  phone: string;

  /**
   * App metadata
   */
  app_metadata: Record<string, unknown>;

  /**
   * User metadata
   */
  user_metadata: Record<string, unknown>;

  /**
   * Role
   */
  role: string;

  /**
   * Authenticator assurance level
   */
  aal?: string;

  /**
   * Authentication method reference
   */
  amr?: {
    /**
     * Authentication method
     */
    method: string;

    /**
     * Authentication timestamp
     */
    timestamp: number;

    /**
     * Authentication provider
     */
    provider?: string;
  }[];

  /**
   * Session ID
   */
  session_id: string;
}

// export const signJwt = async (claims: SupabaseSessionClaims) => {
//   const jwt = await new SignJWT(claims)
//     .setProtectedHeader({
//       alg: "HS256",
//       // kid:
//     })
//     .setIssuedAt()
//     .setExpirationTime("1h")
//     .sign();

//   return jwt;
// };

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
