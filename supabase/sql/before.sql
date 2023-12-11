/**
 * Setup miscellaneous things before the main setup
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Auth
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Public
REVOKE ALL ON SCHEMA public FROM anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Utilities (Non-public helper functions)
CREATE SCHEMA IF NOT EXISTS utilities;
REVOKE ALL ON SCHEMA utilities FROM anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

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
