/**
 * Setup miscellaneous things before the main setup
 *
 * Prerequisites: none
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Utilities (Non-public helpers)
CREATE SCHEMA IF NOT EXISTS utilities;

/* -------------------------------------- Setup extensions ------------------------------------- */

-- PostGIS
CREATE EXTENSION
IF NOT EXISTS postgis
WITH SCHEMA extensions;

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
