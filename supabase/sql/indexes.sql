/**
 * Setup indexes
 * Dependencies: tables.sql
 */

-- Posts
CREATE INDEX posts_geotimestamp_index ON public.posts USING GIST (geotimestamp.location);
