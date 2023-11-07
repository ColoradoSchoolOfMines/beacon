/**
 * @file Runtime and environment variables
 */

/**
 * Current semantic version
 */
export const VERSION = import.meta.env.VERSION;

/**
 * Current commit hash
 */
export const GIT_COMMIT = import.meta.env.GIT_COMMIT;

/**
 * Current branch name
 */
export const GIT_BRANCH = import.meta.env.GIT_BRANCH;

/**
 * hCaptcha site key
 */
export const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

/**
 * Supabase API URL
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase API key
 */
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
