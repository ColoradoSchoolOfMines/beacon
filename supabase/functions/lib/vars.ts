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
 * SMTP host
 */
const SMTP_HOST = Deno.env.get("SMTP_HOST")!;

/**
 * SMTP port
 */
const SMTP_PORT = Number.parseInt(Deno.env.get("SMTP_PORT") ?? "465");

/**
 * SMTP TLS
 */
const SMTP_TLS =
  (
    Deno.env.get("SMTP_TLS") ?? (SMTP_PORT === 465 ? "true" : "false")
  ).toLowerCase() === "true";

/**
 * SMTP username
 */
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME")!;

/**
 * SMTP password
 */
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD")!;

/**
 * SMTP from address
 */
const SMTP_FROM = Deno.env.get("SMTP_FROM")! ?? SMTP_USERNAME;

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
 * Supabase service role key
 */
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  HCAPTCHA_SITE_KEY: HCAPTCHA_SITE_KEY,
  HCAPTCHA_SECRET_KEY: HCAPTCHA_SECRET_KEY,
  SMTP_HOST: SMTP_HOST,
  SMTP_TLS: SMTP_TLS,
  SMTP_PORT: SMTP_PORT,
  SMTP_USERNAME: SMTP_USERNAME,
  SMTP_PASSWORD: SMTP_PASSWORD,
  SMTP_FROM: SMTP_FROM,
  SUPABASE_DB_URL: SUPABASE_DB_URL,
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY,
  X_SUPABASE_JWT_SECRET: X_SUPABASE_JWT_SECRET,
  X_SUPABASE_JWT_ISSUER: X_SUPABASE_JWT_ISSUER,
  X_SUPABASE_JWT_EXP: X_SUPABASE_JWT_EXP,
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
  SMTP_HOST,
  SMTP_TLS,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_FROM,
  SUPABASE_DB_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  X_SUPABASE_JWT_SECRET,
  X_SUPABASE_JWT_ISSUER,
  X_SUPABASE_JWT_EXP,
};
