/**
 * @file Environment variables
 */

/**
 * hCaptcha site key
 */
const HCAPTCHA_SITE_KEY = Deno.env.get("HCAPTCHA_SITE_KEY")!;

/**
 * hCaptcha secret key
 */
const HCAPTCHA_SECRET_KEY = Deno.env.get("HCAPTCHA_SECRET_KEY")!;

/**
 * Supabase database URL
 */
const X_SUPABASE_DB_URL =
  Deno.env.get("X_SUPABASE_DB_URL") ?? Deno.env.get("SUPABASE_DB_URL")!;

/**
 * Supabase API URL
 */
const X_SUPABASE_URL =
  Deno.env.get("X_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;

/**
 * Supabase anonymous key
 */
const X_SUPABASE_ANON_KEY =
  Deno.env.get("X_SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * Supabase service role key
 */
const X_SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("X_SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Supabase JWT secret
 */
const X_SUPABASE_JWT_SECRET = Deno.env.get("X_SUPABASE_JWT_SECRET")!;

/**
 * Supabase JWT issuer
 */
const X_SUPABASE_JWT_ISSUER = Deno.env.get("X_SUPABASE_JWT_ISSUER")!;

/**
 * Supabase JWT expiration time (in seconds)
 */
const X_SUPABASE_JWT_EXP = Number.parseInt(
  Deno.env.get("X_SUPABASE_JWT_EXP") ?? "3600",
);

// Validate variables
const vars = {
  HCAPTCHA_SITE_KEY,
  HCAPTCHA_SECRET_KEY,
  X_SUPABASE_DB_URL,
  X_SUPABASE_URL,
  X_SUPABASE_ANON_KEY,
  X_SUPABASE_SERVICE_ROLE_KEY,
  X_SUPABASE_JWT_SECRET,
  X_SUPABASE_JWT_ISSUER,
  X_SUPABASE_JWT_EXP,
};

const missing = [];
for (const [name, value] of Object.entries(vars)) {
  if (value === undefined) {
    missing.push(name);
  }
}

if (missing.length > 0) {
  throw new Error(`Variable(s) ${missing.join(", ")} must be set!`);
}

export {
  HCAPTCHA_SITE_KEY,
  HCAPTCHA_SECRET_KEY,
  X_SUPABASE_DB_URL,
  X_SUPABASE_URL,
  X_SUPABASE_ANON_KEY,
  X_SUPABASE_SERVICE_ROLE_KEY,
  X_SUPABASE_JWT_SECRET,
  X_SUPABASE_JWT_ISSUER,
  X_SUPABASE_JWT_EXP,
};
