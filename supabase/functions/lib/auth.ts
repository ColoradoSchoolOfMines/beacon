/**
 * @file Auth utilities
 */

import {JWTPayload, SignJWT} from "jose";
import {Session} from "@supabase/supabase-js";
import {
  X_SUPABASE_JWT_SECRET,
  X_SUPABASE_JWT_ISSUER,
  X_SUPABASE_JWT_EXP,
} from "~/lib/vars.ts";
import {crypto} from "std/crypto/mod.ts";
import {encodeBase64Url} from "std/encoding/base64url.ts";
import {serviceRoleClient} from "~/lib/supabase.ts";

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
const decodedSupabaseJwtSecret = new TextEncoder().encode(
  X_SUPABASE_JWT_SECRET,
);

/**
 * Generate a cryptographically secure token
 * @see https://github.com/supabase/gotrue/blob/41aac695029a8e8ae6aeed87e71abea63030c799/internal/crypto/crypto.go#L17C13-L17C13
 * @returns Token
 */
const generateToken = () => {
  const raw = crypto.getRandomValues(new Uint8Array(16));
  const encoded = encodeBase64Url(raw);

  return encoded;
};

/**
 * Generate a session for a user
 * @param rawId Raw user ID
 * @param method Authentication method
 * @returns Session
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

  // Create a refresh token entry
  const refreshToken = generateToken();
  const refreshTokenRes = await serviceRoleClient
    .schema("auth")
    .from("refresh_tokens")
    .insert({
      instance_id: "00000000-0000-0000-0000-000000000000",
      token: refreshToken,
      user_id: userRes1.data.user.id,
      revoked: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      session_id: sessionRes.data.id,
    });

  if (refreshTokenRes.error !== null) {
    throw new Error("Failed to create refresh token");
  }

  /**
   * Mint an access token JWT
   *
   * @see https://github.com/supabase/gotrue/blob/af83b34850dfe7d983a41a8fb5d02d325ee72985/internal/api/token.go#L295
   */
  const accessToken = await new SignJWT({
    aud: userRes1.data.user.aud,
    iss: X_SUPABASE_JWT_ISSUER,
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
        timestamp: Math.floor(now.getTime() / 1000),
      },
    ],
    session_id: sessionRes.data.id,
  } as SupabaseJwtClaims)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt(now)
    .setExpirationTime(X_SUPABASE_JWT_EXP)
    .sign(decodedSupabaseJwtSecret);

  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: X_SUPABASE_JWT_EXP,
    expires_at: Math.floor(
      new Date(now.getTime() + X_SUPABASE_JWT_EXP).getTime() / 1000,
    ),
    refresh_token: refreshToken,
    user: userRes1.data.user,
  } as Session;
};
