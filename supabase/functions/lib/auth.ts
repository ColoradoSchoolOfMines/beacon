/**
 * @file Auth utilities
 */

import {JWTPayload, SignJWT} from "jose";
import {
  SUPABASE_JWT_SECRET,
  SUPABASE_JWT_ISSUER,
  SUPABASE_JWT_EXP,
} from "~/lib/vars.ts";
import {crypto} from "std/crypto/mod.ts";
import {encodeHex} from "std/encoding/hex.ts";
import {serviceRoleClient} from "~/lib/supabase.ts";

/**
 * Generate a random numeric code
 * @param length Code length
 * @returns Random numeric code
 */
export const generateCode = (length: number) => {
  // Get random data
  const random = crypto.getRandomValues(new Uint8Array(length));

  // Encode the data (We lose some entropy here, but it's fine)
  const view = new DataView(random.buffer);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.round((10 * view.getUint8(i)) / 0xff).toString(10);
  }

  return code;
};

/**
 * Generate a token hash
 * @param emailOrPhone User email or phone number
 * @param code Verification code
 * @see https://github.com/supabase/gotrue/blob/c03ae091ab69c20afcd98577fb96a59719777c1b/internal/crypto/crypto.go#L41
 */
export const generateTokenHash = async (emailOrPhone: string, code: string) => {
  // Hash the token
  const hash = await crypto.subtle.digest(
    "SHA-224",
    new TextEncoder().encode(emailOrPhone + code),
  );

  // Encode the hash
  return encodeHex(hash);
};

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
 * Decoded Supabase JWT secret
 */
const decodedSupabaseJwtSecret = new TextEncoder().encode(SUPABASE_JWT_SECRET);

/**
 * Generate a session for a user
 * @param rawId Raw user ID
 * @param method Authentication method
 * @returns Minted JWT session
 */
export const generateSession = async (rawId: string, method: string) => {
  // Get the user
  const userRes1 = await serviceRoleClient.auth.admin.getUserById(rawId);

  if (userRes1.error !== null || userRes1.data === null) {
    throw new Error("Failed to get user");
  }

  const now = new Date();

  // Update the user
  const userRes2 = await serviceRoleClient
    .schema("auth")
    .from("users")
    .update({
      last_sign_in_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userRes1.data.user.id);

  if (userRes2.error !== null) {
    throw new Error("Failed to update user");
  }

  // Create a session entry
  const sessionRes = await serviceRoleClient
    .schema("auth")
    .from("sessions")
    .insert({
      id: crypto.randomUUID(),
      user_id: userRes1.data.user.id,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      aal: "aal1",
    })
    .select("id")
    .single();

  if (sessionRes.error !== null || sessionRes.data === null) {
    throw new Error("Failed to create session");
  }

  /**
   * Mint a JWT
   *
   * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/api/token.go#L295
   */
  const jwt = await new SignJWT({
    aud: userRes1.data.user.aud,
    iss: SUPABASE_JWT_ISSUER,
    sub: userRes1.data.user.id,
    email: userRes1.data.user.email ?? "",
    phone: userRes1.data.user.phone ?? "",
    app_metadata: userRes1.data.user.app_metadata,
    user_metadata: userRes1.data.user.user_metadata,
    role: userRes1.data.user.role,
    aal: "aal1",
    amr: [
      {
        method,
        // Sure hope this isn't running in 2038 :)
        timestamp: Math.floor(now.getTime() / 1000),
      },
    ],
    session_id: sessionRes.data.id,
  } as SupabaseJwtClaims)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(SUPABASE_JWT_EXP)
    .sign(decodedSupabaseJwtSecret);

  return jwt;
};
