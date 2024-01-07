/**
 * Setup miscellaneous things after the main setup
 *
 * Prerequisites: before.sql, tables_*.sql
 */

/* -------------------------------------- Setup cron jobs -------------------------------------- */

-- Clean expired WebAuthn challenges
SELECT cron.schedule(
  'hourly-webauthn-challenge-cleanup',
  '0 * * * *',
  'SELECT utilities.prune_webauthn_challenges()'
);
