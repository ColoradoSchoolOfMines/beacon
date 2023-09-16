/**
 * Setup Postgres extensions
 * Dependencies: none
 */

-- PostGIS
CREATE EXTENSION
IF NOT EXISTS postgis
WITH SCHEMA extensions;
