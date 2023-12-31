/**
 * Setup miscellaneous things after the main setup
 *
 * Prerequisites: before.sql, tables.sql
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Auth
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- Public
REVOKE ALL ON SCHEMA public FROM anon, authenticated;

-- Utilities (Non-public helpers)
REVOKE ALL ON SCHEMA utilities FROM anon, authenticated;

/* -------------------------------------- Setup cron jobs -------------------------------------- */

-- Clean expired WebAuthn challenges
SELECT cron.schedule(
  'hourly-webauthn-challenge-cleanup',
  '0 * * * *',
  'SELECT auth.clean_expired_webauthn_challenges()'
);
