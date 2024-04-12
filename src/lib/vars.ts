/**
 * @file Runtime and environment variables
 */

/**
 * Current semantic version
 */
const VERSION = import.meta.env.VERSION;

/**
 * Current commit hash
 */
const GIT_COMMIT = import.meta.env.GIT_COMMIT;

/**
 * Current branch name
 */
const GIT_BRANCH = import.meta.env.GIT_BRANCH;

/**
 * Functions absolute base URL
 */
const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as
  | string
  | undefined;

/**
 * hCaptcha site key
 */
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

/**
 * Supabase API URL
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase API anonymous key
 */
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * The terms and conditions markdown text
 */
const TERMS_AND_CONDITIONS = import.meta.env.VITE_TERMS_AND_CONDITIONS;

/**
 * The privacy policy markdown text
 */
const PRIVACY_POLICY = import.meta.env.VITE_PRIVACY_POLICY;

// Validate variables
const vars = {
  VERSION,
  GIT_COMMIT,
  GIT_BRANCH,
  HCAPTCHA_SITE_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TERMS_AND_CONDITIONS,
  PRIVACY_POLICY,
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
  FUNCTIONS_URL,
  GIT_BRANCH,
  GIT_COMMIT,
  HCAPTCHA_SITE_KEY,
  PRIVACY_POLICY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  TERMS_AND_CONDITIONS,
  VERSION,
};
