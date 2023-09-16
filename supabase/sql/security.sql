/**
 * Setup column and row level security policies
 * Dependencies: tables.sql
 */

-- Profiles
CREATE POLICY select_profiles
ON public.profiles
FOR SELECT
TO public;

CREATE POLICY insert_profiles
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY update_profiles
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY delete_profiles
ON public.profiles
FOR DELETE
USING (id = auth.uid());

-- Posts

-- TODO: fix this policy
-- CREATE POLICY select_posts
-- ON public.posts
-- FOR SELECT
-- TO public
-- USING (
--   -- Only show posts within the user's radius
--   ST_DistanceSphere(geotimestamp.location, (
--     SELECT geotimestamps[0].location
--     FROM public.profiles
--     WHERE id = auth.uid()
--   )) <= radius
-- );

CREATE POLICY insert_posts
ON public.posts
FOR INSERT
WITH CHECK (poster = auth.uid());

CREATE POLICY update_posts
ON public.posts
FOR UPDATE
USING (poster = auth.uid());

CREATE POLICY delete_posts
ON public.posts
FOR DELETE
USING (poster = auth.uid());

-- Comments
CREATE POLICY select_comments
ON public.comments
FOR SELECT
TO public;

CREATE POLICY insert_comments
ON public.comments
FOR INSERT
WITH CHECK (commenter = auth.uid());

CREATE POLICY update_comments
ON public.comments
FOR UPDATE
USING (commenter = auth.uid());

CREATE POLICY delete_comments
ON public.comments
FOR DELETE
USING (commenter = auth.uid());
