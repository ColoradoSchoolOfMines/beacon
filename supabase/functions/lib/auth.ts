/**
 * @file Auth utilities
 */

import {JWTPayload, SignJWT} from "jose";
import {
  SUPABASE_JWT_SECRET,
  SUPABASE_JWT_ISSUER,
  SUPABASE_JWT_EXP,
} from "~/lib/vars.ts";
import {dbClient} from "~/lib/supabase.ts";

/**
 * Supabase JWT claims
 *
 * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/api/token.go#L22
 * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/models/sessions.go#L38
 */
interface SupabaseJwtClaims extends JWTPayload {
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
  session_id?: string;
}

/**
 * Authenticator assurance level 1
 */
const AAL1 = "aal1";

/**
 * Decoded Supabase JWT secret
 */
const decodedSupabaseJwtSecret = new TextEncoder().encode(SUPABASE_JWT_SECRET);

/**
 * Generate a session for a user
 * @param rawId Raw user ID
 * @returns Minted JWT session
 */
export const generateSession = async (rawId: string) => {
  // Get the user
  const {rows: userRows} = await dbClient.queryObject<{
    id: string;
    aud?: string;
    role?: string;
    email?: string;
    phone?: string;
    raw_app_meta_data?: Record<string, unknown>;
    raw_user_meta_data?: Record<string, unknown>;
  }>(
    "SELECT id, aud, role, email, phone, raw_app_meta_data, raw_user_meta_data FROM auth.users WHERE id = $1;",
    [
      rawId,
    ],
  );

  if (
    userRows.length === 0 ||
    userRows[0].aud === undefined ||
    userRows[0].role === undefined ||
    userRows[0].email === undefined ||
    userRows[0].phone === undefined ||
    userRows[0].raw_app_meta_data === undefined ||
    userRows[0].raw_user_meta_data === undefined
  ) {
    throw new Error("Failed to get user");
  }

  // Create a session entry
  const {rows: sessionRows} = await dbClient.queryObject<{
    id: string;
  }>(
    "INSERT INTO auth.sessions (user_id, created_at, updated_at, aal) VALUES ($1, $2, $2, $3) RETURNING id;",
    [
      userRows[0].id,
      new Date(),
      AAL1,
    ],
  );

  if (sessionRows.length === 0) {
    throw new Error("Failed to create session");
  }

  /**
   * Mint a JWT
   *
   * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/api/token.go#L295
   */
  const jwt = await new SignJWT({
    aud: userRows[0].aud,
    iss: SUPABASE_JWT_ISSUER,
    sub: userRows[0].id,
    email: userRows[0].email ?? "",
    phone: userRows[0].phone ?? "",
    app_metadata: userRows[0].raw_app_meta_data,
    user_metadata: userRows[0].raw_user_meta_data,
    role: userRows[0].role,
    aal: AAL1,
    amr: [
      {
        method: "webauthn",
        // Sure hope this isn't running in 2038 :)
        timestamp: Math.floor(Date.now() / 1000),
      },
    ],
    session_id: sessionRows[0].id,
  } as SupabaseJwtClaims)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(SUPABASE_JWT_EXP)
    .sign(decodedSupabaseJwtSecret);

  return jwt;
};
