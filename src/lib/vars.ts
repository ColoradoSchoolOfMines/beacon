/**
 * @file Runtime and environment variables
 */

/**
 * Runtime variables
 */
const RUNTIME_VARS = (
  import.meta.env.DEV ? import.meta.env : (window as any).__VITE_VARS__
) as ImportMetaEnv;

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
const FUNCTIONS_URL = RUNTIME_VARS.VITE_SUPABASE_FUNCTIONS_URL as
  | string
  | undefined;

/**
 * hCaptcha site key
 */
const HCAPTCHA_SITE_KEY = RUNTIME_VARS.VITE_HCAPTCHA_SITE_KEY;

/**
 * Supabase API URL
 */
const SUPABASE_URL = RUNTIME_VARS.VITE_SUPABASE_URL;

/**
 * Supabase API anonymous key
 */
const SUPABASE_ANON_KEY = RUNTIME_VARS.VITE_SUPABASE_ANON_KEY;

// Validate variables
const vars = {
  VERSION,
  GIT_COMMIT,
  GIT_BRANCH,
  HCAPTCHA_SITE_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
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
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERSION,
};
