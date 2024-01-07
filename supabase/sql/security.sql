/**
 * Setup security policies
 */

/* --------------------------------------- Setup schemas --------------------------------------- */

-- Auth
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- Utilities (Non-public helpers)
REVOKE ALL ON SCHEMA utilities FROM anon, authenticated;

-- Public
REVOKE ALL ON SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

/* ----------------------------------- Setup role permissions ---------------------------------- */

-- Profiles
GRANT SELECT ON public.profiles TO authenticated;

-- User locations
GRANT SELECT, DELETE ON public.locations TO authenticated;
GRANT INSERT (
  location
)
ON public.locations
TO authenticated;

-- Posts
GRANT SELECT ON public.personalized_posts TO authenticated;
GRANT SELECT (id) ON public.posts TO authenticated;
GRANT DELETE ON public.posts TO authenticated;
GRANT INSERT (
  private_anonymous,
  radius,
  content,
  has_media,
  blur_hash,
  aspect_ratio
)
ON public.posts
TO authenticated;

-- Post votes
GRANT SELECT, DELETE ON public.post_votes TO authenticated;
GRANT INSERT, UPDATE (
  post_id,
  upvote
)
ON public.post_votes TO authenticated;

-- Post reports
GRANT SELECT, DELETE ON public.post_reports TO authenticated;
GRANT INSERT (
  post_id
)
ON public.post_reports TO authenticated;

-- Comments
GRANT SELECT ON public.personalized_comments TO authenticated;
GRANT SELECT (id) ON public.comments TO authenticated;
GRANT DELETE ON public.comments TO authenticated;
GRANT INSERT (
  private_anonymous,
  post_id,
  parent_id,
  content
)
ON public.comments TO authenticated;

-- Comment votes
GRANT SELECT, DELETE ON public.comment_votes TO authenticated;
GRANT INSERT, UPDATE (
  comment_id,
  upvote
)
ON public.comment_votes TO authenticated;

-- Comment reports
GRANT SELECT, DELETE ON public.comment_reports TO authenticated;
GRANT INSERT (
  comment_id
)
ON public.comment_reports TO authenticated;

-- Public functions
GRANT EXECUTE ON FUNCTION public.delete_webauthn_credentials() TO authenticated;
GRANT EXECUTE ON FUNCTION public.distance_to(GEOGRAPHY(POINT, 4326)) TO authenticated;

/* ----------------------------- Row-level security (RLS) policies ----------------------------- */

-- Enable row-level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY select_profiles
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- User locations
CREATE POLICY select_locations
ON public.locations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY insert_locations
ON public.locations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY delete_locations
ON public.locations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Posts
CREATE POLICY select_posts
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Only get posts for which the user is the poster
  private_poster_id = auth.uid()

  -- Or only get posts for which the user is within the post's radius
  OR public.distance_to(private_location) <= radius
);

CREATE POLICY insert_posts
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (private_poster_id = auth.uid());

CREATE POLICY delete_posts
ON public.posts
FOR DELETE
TO authenticated
USING (private_poster_id = auth.uid());

-- Post votes
CREATE POLICY select_post_votes
ON public.post_votes
FOR SELECT
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY insert_post_votes
ON public.post_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid());

CREATE POLICY update_post_votes
ON public.post_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY delete_post_votes
ON public.post_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Post reports
CREATE POLICY select_post_reports
ON public.post_reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY insert_post_reports
ON public.post_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY delete_post_reports
ON public.post_reports
FOR DELETE
TO authenticated
USING (reporter_id = auth.uid());

-- Comments
CREATE POLICY select_comments
ON public.comments
FOR SELECT
TO authenticated
USING (
  -- Only get comments for which the user is the commenter
  private_commenter_id = auth.uid()

  -- Or only show comments for posts the user is the poster of or can see
  OR post_id IN (
    SELECT id
    FROM public.posts post
    WHERE
      -- Only get posts for which the user is the poster
      post.private_poster_id = auth.uid()

      -- Or only get posts for which the user is within the post's radius
      OR public.distance_to(post.private_location) <= post.radius
  )
);

CREATE POLICY insert_comments
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (private_commenter_id = auth.uid());

CREATE POLICY delete_comments
ON public.comments
FOR DELETE
TO authenticated
USING (private_commenter_id = auth.uid());

-- Comment votes
CREATE POLICY select_comment_votes
ON public.comment_votes
FOR SELECT
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY insert_comment_votes
ON public.comment_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid());

CREATE POLICY update_comment_votes
ON public.comment_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid());

CREATE POLICY delete_comment_votes
ON public.comment_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Comment reports
CREATE POLICY select_comment_reports
ON public.comment_reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY insert_comment_reports
ON public.comment_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY delete_comment_reports
ON public.comment_reports
FOR DELETE
TO authenticated
USING (reporter_id = auth.uid());

-- Media
CREATE POLICY select_media_objects
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY insert_media_objects
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Media bucket
  bucket_id = 'media'

  -- Valiate the object name
  AND utilities.validate_media_object_name(name, auth.uid())
);

CREATE POLICY delete_media_objects
ON storage.objects
FOR DELETE
TO authenticated
USING (
  -- Media bucket
  bucket_id = 'media'

  -- Valiate the object name
  AND utilities.validate_media_object_name(name, auth.uid())
);
