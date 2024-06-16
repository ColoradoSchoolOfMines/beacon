/**
 * Setup views
 */

/* ---------------------------------------- Setup views ---------------------------------------- */

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
      post.views,
      post.upvotes,
      post.downvotes,
      post.comments,
      public.distance_to(post.private_location) AS distance,

      profile.color AS poster_color,
      profile.emoji AS poster_emoji,

      vote.upvote
    FROM public.posts post
    LEFT JOIN public.profiles profile ON profile.id = post.poster_id
    LEFT JOIN public.post_votes vote ON vote.post_id = post.id AND vote.voter_id = auth.uid()
  )
  SELECT
    id,
    poster_id,
    created_at,
    content,
    has_media,
    blur_hash,
    aspect_ratio,
    views,
    upvotes,
    downvotes,
    comments,
    distance,
    public.calculate_rank(distance, upvotes - downvotes, created_at) AS rank,

    private_poster_id = auth.uid() AS is_mine,
    poster_color,
    poster_emoji,

    upvote
  FROM personalized_post
  -- This view doesn't have RLS, so we need to filter out posts the user can't see
  WHERE (
    -- Only select posts for which the user is the poster
    personalized_post.private_poster_id = auth.uid()

    -- Or only select posts for which the user is within the post's radius
    OR personalized_post.distance <= personalized_post.radius
  )
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
      comment.views,
      comment.upvotes,
      comment.downvotes,

      profile.color AS commenter_color,
      profile.emoji AS commenter_emoji,

      vote.upvote
    FROM public.comments comment
    LEFT JOIN public.profiles profile ON profile.id = comment.commenter_id
    LEFT JOIN public.comment_votes vote ON vote.comment_id = comment.id AND vote.voter_id = auth.uid()
  )
  SELECT
    id,
    commenter_id,
    post_id,
    parent_id,
    created_at,
    content,
    views,
    upvotes,
    downvotes,
    public.calculate_rank(0, upvotes - downvotes, created_at) AS rank,

    private_commenter_id = auth.uid() AS is_mine,
    commenter_color,
    commenter_emoji,

    upvote
  FROM personalized_comment
  -- This view doesn't have RLS, so we need to filter out comments the user can't see
  WHERE (
    -- Only get comments for which the user is the commenter
    personalized_comment.private_commenter_id = auth.uid()

    -- Or only show comments for posts the user has access to
    OR public.validate_post_access(post_id)
  )
);
