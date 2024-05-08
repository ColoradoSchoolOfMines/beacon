/**
 * Setup miscellaneous things before the main setup
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Utilities (Non-public helpers)
CREATE SCHEMA IF NOT EXISTS utilities;

/* -------------------------------------- Setup extensions ------------------------------------- */

-- PostGIS
CREATE EXTENSION
IF NOT EXISTS postgis
WITH SCHEMA extensions;

-- pg_cron
CREATE EXTENSION
IF NOT EXISTS pg_cron
WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

/* --------------------------------------- Setup buckets --------------------------------------- */

-- Media
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'media',
  'media',
  TRUE,
  4194304, -- 4 MiB
  ARRAY[
    -- Images
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',

    -- Videos
    'video/mp4',
    'video/mpeg',
    'video/webm'
  ]
);
