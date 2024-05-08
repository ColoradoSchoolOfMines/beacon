/**
 * Setup miscellaneous things after the main setup
 */

/* -------------------------------------- Setup cron jobs -------------------------------------- */

-- Prune expired locations
SELECT cron.schedule(
  'hourly-location-cleanup',
  '0 * * * *',
  'SELECT utilities.prune_expired_locations()'
);

-- Prune expired WebAuthn challenges
SELECT cron.schedule(
  'hourly-webauthn-challenge-cleanup',
  '0 * * * *',
  'SELECT utilities.prune_expired_webauthn_challenges()'
);
