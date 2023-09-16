/**
 * Setup custom types
 * Dependencies: none
 */

-- Geotimestamp represents a timestamp and location on Earth
CREATE TYPE public.geotimestamp AS (
  -- Timestamp of the geotimestamp
  time TIMESTAMPTZ,

  -- Location of the geotimestamp (EPSG4326 - 2D ellipsoidal coordinates)
  location GEOGRAPHY(POINT, 4326)
);
