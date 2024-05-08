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
