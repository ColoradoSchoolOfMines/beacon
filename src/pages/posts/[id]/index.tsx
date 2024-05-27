/**
 * @file Post index page
 */
/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */

import {
  IonBackButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  addOutline,
  addSharp,
  arrowDownOutline,
  arrowDownSharp,
  arrowUpOutline,
  arrowUpSharp,
} from "ionicons/icons";
import {FC, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {useMeasure} from "react-use";

import {CommentCard} from "~/components/comment-card";
import {PostCard} from "~/components/post-card";
import {ScrollableContent} from "~/components/scrollable-content";
import {SwipeableItem} from "~/components/swipeable-item";
import {insertView, toggleVote} from "~/lib/entities";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Comment, Post} from "~/lib/types";

/**
 * Post index page
 * @returns JSX
 */
export const PostIndex: FC = () => {
  // Hooks
  const [post, setPost] = useState<Post | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const waitForLocation = useEphemeralStore(state => state.waitForLocation);
  const showFABs = usePersistentStore(state => state.showFABs);
  const [sizerRef, {width}] = useMeasure<HTMLDivElement>();
  const params = useParams<{id: string}>();
  const history = useHistory();

  // Effects
  useEffect(() => {
    // Update the initial post
    updatePost();
  }, []);

  // Methods
  /**
   * Set the comment
   * @param newComment New comment
   * @returns Void
   */
  const setComment = (newComment: Comment) =>
    setComments(
      comments.map(comment =>
        comment.id === newComment.id ? newComment : comment,
      ),
    );

  /**
   * Update the post
   */
  const updatePost = async () => {
    // Get the post
    const {data, error} = await client
      .from("personalized_posts")
      .select(
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, upvotes, downvotes, comments, distance, rank, is_mine, poster_color, poster_emoji, upvote",
      )
      .eq("id", params.id)
      .single();

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Update the state
    setPost(data as any);
  };

  /**
   * Fetch comments
   * @param limit Comments limit
   * @param cutoffRank Cutoff rank or undefined for no cutoff
   * @returns Comments
   */
  const fetchComments = async (limit: number, cutoffRank?: number) => {
    // Wait for a location
    await waitForLocation();

    // Build the query
    let query = client
      .from("personalized_comments")
      .select(
        "id, commenter_id, post_id, parent_id, created_at, content, views, upvotes, downvotes, rank, is_mine, commenter_color, commenter_emoji, upvote",
      )
      .eq("post_id", params.id);

    if (cutoffRank !== undefined) {
      query = query.lt("rank", cutoffRank);
    }

    query = query.order("rank", {ascending: false}).limit(limit);

    // Fetch comments
    const {data, error} = await query;

    // Handle error
    if (data === null || error !== null) {
      return [];
    }

    return data as any as Comment[];
  };

  /**
   * Comment view event handler
   * @param comment Comment that was viewed
   */
  const onCommentViewed = async (comment: Comment) => {
    // Insert the view
    await insertView("comment_views", "comment_id", comment.id);
  };

  /**
   * Toggle a vote on a post
   * @param post Post to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const togglePostVote = async (post: Post, upvote: boolean) => {
    await toggleVote(post, setPost, upvote, "post_votes", "post_id");
  };

  /**
   * Delete a post
   * @param post Post to delete
   */
  const deletePost = async (post: Post) => {
    // Delete the post
    await client.from("posts").delete().eq("id", post.id);

    // Redirect to the nearby page
    history.push("/nearby");
  };

  /**
   * Toggle a vote on a comment
   * @param comment Comment to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const toggleCommentVote = async (comment: Comment, upvote: boolean) => {
    await toggleVote(
      comment,
      setComment,
      upvote,
      "comment_votes",
      "comment_id",
    );
  };

  /**
   * Delete a comment
   * @param comment Comment to delete
   */
  const deleteComments = async (comment: Comment) => {
    // Delete the comment
    await client.from("comments").delete().eq("id", comment.id);

    // Remove the comment from the state
    setComments(comments.filter(c => c.id !== comment.id));
  };

  /**
   * Create a comment
   */
  const createComment = () => {
    // Go to the create comment page
    history.push(`/posts/${params.id}/comments/create/1`);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/nearby" />
          </IonButtons>

          <IonTitle>Post</IonTitle>
        </IonToolbar>
      </IonHeader>

      <ScrollableContent
        contentItemName="comment"
        contentItems={comments}
        setContentItems={setComments}
        contentItemIDKey="id"
        contentItemRankKey="rank"
        onContentItemViewed={onCommentViewed}
        contentItemRenderer={(comment, _, onLoad) => (
          <SwipeableItem
            key={comment.id}
            startOption={
              <IonItemOption color="success">
                <IonIcon
                  slot="icon-only"
                  ios={arrowUpOutline}
                  md={arrowUpSharp}
                />
              </IonItemOption>
            }
            endOption={
              <IonItemOption color="danger">
                <IonIcon
                  slot="icon-only"
                  ios={arrowDownOutline}
                  md={arrowDownSharp}
                />
              </IonItemOption>
            }
            startAction={() => toggleCommentVote(comment, true)}
            endAction={() => toggleCommentVote(comment, false)}
          >
            <IonItem lines="none">
              <CommentCard
                className="max-w-256 mx-auto my-2 w-full"
                comment={comment}
                onLoad={onLoad}
                toggleVote={upvote => toggleCommentVote(comment, upvote)}
                onDeleted={
                  comment.is_mine ? () => deleteComments(comment) : undefined
                }
              />
            </IonItem>
          </SwipeableItem>
        )}
        fetchContent={fetchComments}
        onRefresh={updatePost}
        header={
          <>
            {post !== undefined && (
              <SwipeableItem
                className="overflow-initial"
                key={post.id}
                startOption={
                  <IonItemOption color="success">
                    <IonIcon
                      slot="icon-only"
                      ios={arrowUpOutline}
                      md={arrowUpSharp}
                    />
                  </IonItemOption>
                }
                endOption={
                  <IonItemOption color="danger">
                    <IonIcon
                      slot="icon-only"
                      ios={arrowDownOutline}
                      md={arrowDownSharp}
                    />
                  </IonItemOption>
                }
                startAction={() => togglePostVote(post, true)}
                endAction={() => togglePostVote(post, false)}
              >
                <IonItem>
                  <PostCard
                    className="max-w-256 mb-2 mt-4 mx-auto w-full"
                    post={post}
                    postLinkDetail={false}
                    width={width}
                    toggleVote={upvote => togglePostVote(post, upvote)}
                    onDeleted={
                      post.is_mine ? () => deletePost(post) : undefined
                    }
                  />
                </IonItem>
              </SwipeableItem>
            )}

            <IonItem className="h-0" lines="none">
              <div className="max-w-256 w-full" ref={sizerRef} />
            </IonItem>
          </>
        }
      />

      {showFABs && (
        <IonFab slot="fixed" horizontal="end" vertical="bottom">
          <IonFabButton onClick={createComment}>
            <IonIcon ios={addOutline} md={addSharp} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};
