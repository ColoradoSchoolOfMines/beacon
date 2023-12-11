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
 * hCaptcha site key
 */
const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

/**
 * Supabase API URL
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase API anonymous key
 */
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate variables
const vars = {
  VERSION: VERSION,
  GIT_COMMIT: GIT_COMMIT,
  GIT_BRANCH: GIT_BRANCH,
  HCAPTCHA_SITEKEY: HCAPTCHA_SITEKEY,
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
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
  GIT_BRANCH,
  GIT_COMMIT,
  HCAPTCHA_SITEKEY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERSION,
};
