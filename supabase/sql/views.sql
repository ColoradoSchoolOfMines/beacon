/**
 * Setup views
 *
 * Prerequisites: functions.sql, tables_*.sql
 */

-- Posts with additional, cached information that is refreshed by trigger functions
CREATE MATERIALIZED VIEW utilities.cached_posts
AS (
  SELECT
    post.id,

    SUM(CASE WHEN post_vote.upvote THEN 1 ELSE 0 END) AS upvotes,
    SUM(CASE WHEN NOT post_vote.upvote THEN 1 ELSE 0 END) AS downvotes
  FROM public.posts post
  LEFT JOIN public.post_votes post_vote ON post_vote.post_id = post.id
  GROUP BY post.id
);

-- Posts with additional, user-specific information
CREATE VIEW public.personalized_posts
WITH (
  security_barrier = TRUE,
  security_invoker = FALSE
)
AS (
  WITH personalized_post AS (
    SELECT
      post.id,
      post.private_poster_id,
      post.poster_id,
      post.created_at,
      post.radius,
      post.content,
      post.has_media,
      post.blur_hash,
      post.aspect_ratio,

      cached_post.upvotes,
      cached_post.downvotes,

      profile.color AS poster_color,
      profile.emoji AS poster_emoji,

      -- Distance between the post and the user
      public.distance_to(post.private_location) AS distance
    FROM public.posts post
    LEFT JOIN utilities.cached_posts cached_post ON cached_post.id = post.id
    LEFT JOIN public.profiles profile ON profile.id = post.poster_id
  )
  SELECT
    id,
    poster_id,
    created_at,
    radius,
    content,
    has_media,
    blur_hash,
    aspect_ratio,

    upvotes,
    downvotes,

    poster_color,
    poster_emoji,

    distance
  FROM personalized_post
  -- This view doesn't have RLS, so we need to filter out posts the user can't see
  WHERE (
    -- Only select posts for which the user is the poster
    personalized_post.private_poster_id = auth.uid()

    -- Or only select posts for which the user is within the post's radius
    OR personalized_post.distance <= personalized_post.radius
  )
);

-- Comments with additional, cached information that is refreshed by trigger functions
CREATE MATERIALIZED VIEW utilities.cached_comments
AS (
  SELECT
    comment.id,

    SUM(CASE WHEN comment_vote.upvote THEN 1 ELSE 0 END) AS upvotes,
    SUM(CASE WHEN NOT comment_vote.upvote THEN 1 ELSE 0 END) AS downvotes
  FROM public.comments comment
  LEFT JOIN public.comment_votes comment_vote ON comment_vote.comment_id = comment.id
  GROUP BY comment.id
);

-- Comments with additional, user-specific information
CREATE VIEW public.personalized_comments
WITH (
  security_barrier = TRUE,
  security_invoker = FALSE
)
AS (
  WITH personalized_comment AS (
    SELECT
      comment.id,
      comment.private_commenter_id,
      comment.commenter_id,
      comment.post_id,
      comment.parent_id,
      comment.created_at,
      comment.content,

      cached_comment.upvotes,
      cached_comment.downvotes,

      profile.color AS commenter_color,
      profile.emoji AS commenter_emoji
    FROM public.comments comment
    LEFT JOIN utilities.cached_comments cached_comment ON cached_comment.id = comment.id
    LEFT JOIN public.profiles profile ON profile.id = comment.commenter_id
  )
  SELECT
    id,
    commenter_id,
    post_id,
    parent_id,
    created_at,
    content,

    upvotes,
    downvotes,

    commenter_color,
    commenter_emoji
  FROM personalized_comment
  -- This view doesn't have RLS, so we need to filter out comments the user can't see
  WHERE (
    -- Only get comments for which the user is the commenter
    personalized_comment.private_commenter_id = auth.uid()

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
  )
);
