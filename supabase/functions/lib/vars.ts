/**
 * @file Environment variables
 */

/**
 * Supabase database URL
 */
const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL")!;

/**
 * Supabase API URL
 */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

/**
 * Supabase anonymous key
 */
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * Supabase JWT secret
 */
const SUPABASE_JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET")!;

/**
 * Supabase JWT issuer
 */
const SUPABASE_JWT_ISSUER = Deno.env.get("SUPABASE_JWT_ISSUER")!;

/**
 * Supabase JWT expiration time (in seconds)
 */
const SUPABASE_JWT_EXP = Number.parseInt(
  Deno.env.get("SUPABASE_JWT_EXP") ?? "3600",
);

// Parse and validate environment variables
if (SUPABASE_DB_URL === undefined) {
  throw new Error("Environment variable SUPABASE_DB_URL must be set!");
}

if (SUPABASE_URL === undefined) {
  throw new Error("Environment variable SUPABASE_URL must be set!");
}

if (SUPABASE_ANON_KEY === undefined) {
  throw new Error("Environment variable SUPABASE_ANON_KEY must be set!");
}

if (SUPABASE_JWT_SECRET === undefined) {
  throw new Error("Environment variable SUPABASE_JWT must be set!");
}

if (SUPABASE_JWT_ISSUER === undefined) {
  throw new Error("Environment variable SUPABASE_JWT_ISSUER must be set!");
}

export {
  SUPABASE_DB_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_JWT_SECRET,
  SUPABASE_JWT_ISSUER,
  SUPABASE_JWT_EXP,
};
