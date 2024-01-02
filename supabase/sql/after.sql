/**
 * Setup miscellaneous things after the main setup
 *
 * Prerequisites: before.sql, tables.sql
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Auth
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- Utilities (Non-public helpers)
REVOKE ALL ON SCHEMA utilities FROM anon, authenticated;

/* -------------------------------------- Setup cron jobs -------------------------------------- */

-- Clean expired WebAuthn challenges
SELECT cron.schedule(
  'hourly-webauthn-challenge-cleanup',
  '0 * * * *',
  'SELECT auth.prune_webauthn_challenges()'
);
