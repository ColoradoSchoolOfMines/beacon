/**
 * Setup views
 *
 * Prerequisites: functions.sql, tables.sql
 */

-- Posts with additional, cached information
CREATE MATERIALIZED VIEW utilities.cached_posts
AS (
  SELECT
    id,

    utilities.get_post_votes(id, TRUE) AS upvotes,
    utilities.get_post_votes(id, FALSE) AS downvotes
  FROM public.posts
);

-- Posts with additional, public information
CREATE VIEW public.public_posts
WITH (
  security_invoker = TRUE
)
AS (
  SELECT
    post.id,
    post.poster_id,
    post.created_at,
    post.content,
    post.has_media,

    cached_post.upvotes,
    cached_post.downvotes,

    -- Distance between the post and the user
    utilities.anonymized_distance(
      post.private_location,
      utilities.get_latest_location(auth.uid()),
      -- Add an additional 5% location uncertainty relative to the post's radius
      0.05 * post.radius
    ) AS distance
  FROM public.posts post
  LEFT JOIN utilities.cached_posts cached_post ON cached_post.id = post.id
);

-- Comments with additional, cached information
CREATE MATERIALIZED VIEW utilities.cached_comments
AS (
  SELECT
    id,

    utilities.get_comment_votes(id, TRUE) AS upvotes,
    utilities.get_comment_votes(id, FALSE) AS downvotes
  FROM public.comments
);

-- Comments with additional, public information
CREATE VIEW public.public_comments
WITH (
  security_invoker = TRUE
)
AS (
  SELECT
    comment.id,
    comment.commenter_id,
    comment.created_at,
    comment.content,

    cached_comment.upvotes,
    cached_comment.downvotes
  FROM public.comments comment
  LEFT JOIN utilities.cached_comments cached_comment ON cached_comment.id = comment.id
);
