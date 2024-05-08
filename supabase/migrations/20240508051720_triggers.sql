/**
 * Setup triggers
 */

-- Create a profile for a new user
CREATE TRIGGER create_profile_after_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION utilities.setup_profile_trigger();

-- Validate new locations
CREATE TRIGGER validate_location_before_insert
BEFORE INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION utilities.validate_location_trigger();

-- Prune old locations
CREATE TRIGGER prune_locations_after_insert
AFTER INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION utilities.prune_locations_trigger();

-- Anonymize the location of a new post
CREATE TRIGGER anonymize_post_location_before_insert
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION utilities.anonymize_location_trigger();

-- Post deleted
CREATE TRIGGER post_deleted_after_delete
AFTER DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION utilities.post_deleted_trigger();

-- Post view modified
CREATE TRIGGER post_view_modified_after_insert
AFTER INSERT ON public.post_views
FOR EACH ROW
EXECUTE FUNCTION utilities.post_view_modified_trigger();

CREATE TRIGGER post_view_modified_after_update
AFTER UPDATE ON public.post_views
FOR EACH ROW
EXECUTE FUNCTION utilities.post_view_modified_trigger();

CREATE TRIGGER post_view_modified_after_delete
AFTER DELETE ON public.post_views
FOR EACH ROW
EXECUTE FUNCTION utilities.post_view_modified_trigger();

-- Post vote modified
CREATE TRIGGER post_vote_modified_after_insert
AFTER INSERT ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.post_vote_modified_trigger();

CREATE TRIGGER post_vote_modified_after_update
AFTER UPDATE ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.post_vote_modified_trigger();

CREATE TRIGGER post_vote_modified_after_delete
AFTER DELETE ON public.post_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.post_vote_modified_trigger();

-- Comment modified
CREATE TRIGGER comment_modified_after_insert
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_modified_trigger();

CREATE TRIGGER comment_modified_after_update
AFTER UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_modified_trigger();

CREATE TRIGGER comment_modified_after_delete
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_modified_trigger();

-- Comment view modified
CREATE TRIGGER comment_view_modified_after_insert
AFTER INSERT ON public.comment_views
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_view_modified_trigger();

CREATE TRIGGER comment_view_modified_after_update
AFTER UPDATE ON public.comment_views
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_view_modified_trigger();

CREATE TRIGGER comment_view_modified_after_delete
AFTER DELETE ON public.comment_views
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_view_modified_trigger();

-- Comment vote modified
CREATE TRIGGER comment_vote_modified_after_insert
AFTER INSERT ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_vote_modified_trigger();

CREATE TRIGGER comment_vote_modified_after_update
AFTER UPDATE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_vote_modified_trigger();

CREATE TRIGGER comment_vote_modified_after_delete
AFTER DELETE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION utilities.comment_vote_modified_trigger();
