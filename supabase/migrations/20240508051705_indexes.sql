/**
 * Setup indexes
 */

/* ---------------------------------------- Setup indexes --------------------------------------- */

-- User locations
CREATE INDEX locations_user_id ON public.locations (user_id);

-- Posts
CREATE INDEX posts_private_poster_id ON public.posts (private_poster_id);

-- Post views
CREATE INDEX post_views_post_id ON public.post_views (post_id);
CREATE INDEX post_views_viewer_id ON public.post_views (viewer_id);

-- Post votes
CREATE INDEX post_votes_voter_id ON public.post_votes (voter_id);
CREATE INDEX post_votes_post_id ON public.post_votes (post_id);

-- Post reports
CREATE INDEX post_reports_reporter_id ON public.post_reports (reporter_id);
CREATE INDEX post_reports_post_id ON public.post_reports (post_id);

-- Comments
CREATE INDEX comments_private_commenter_id ON public.comments (private_commenter_id);
CREATE INDEX comments_post_id ON public.comments (post_id);
CREATE INDEX comments_parent_id ON public.comments (parent_id);

-- Comment views
CREATE INDEX comment_views_comment_id ON public.comment_views (comment_id);
CREATE INDEX comment_views_viewer_id ON public.comment_views (viewer_id);

-- Comment votes
CREATE INDEX comment_votes_voter_id ON public.comment_votes (voter_id);
CREATE INDEX comment_votes_comment_id ON public.comment_votes (comment_id);

-- Comment reports
CREATE INDEX comment_reports_reporter_id ON public.comment_reports (reporter_id);
CREATE INDEX comment_reports_comment_id ON public.comment_reports (comment_id);
