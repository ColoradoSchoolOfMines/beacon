/**
 * @file Post home page
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
import {PostgrestError} from "@supabase/supabase-js";
import {
  addOutline,
  addSharp,
  arrowDownOutline,
  arrowDownSharp,
  arrowUpOutline,
  arrowUpSharp,
} from "ionicons/icons";
import {cloneDeep} from "lodash-es";
import {FC, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {useMeasure} from "react-use";

import {CommentCard} from "~/components/comment-card";
import {PostCard} from "~/components/post-card";
import {ScrollableContent} from "~/components/scrollable-content";
import {SwipeableItem} from "~/components/swipeable-item";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Comment, Post} from "~/lib/types";

/**
 * Post home page
 * @returns JSX
 */
export const PostHome: FC = () => {
  // Hooks
  const [post, setPost] = useState<Post | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
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
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, distance, upvotes, downvotes, comments, poster_color, poster_emoji, upvote",
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
   * Content refresh event handler
   */
  const onContentRefresh = async () => {
    // Update the post
    await updatePost();
  };

  /**
   * Fetch comments
   * @param start Start index
   * @param end End index
   * @param cutoff Cutoff timestamp
   * @returns Comments
   */
  const fetchComments = async (start: number, end: number, cutoff: Date) => {
    // Fetch comments
    const {data, error} = await client
      .from("personalized_comments")
      .select(
        "id, commenter_id, post_id, parent_id, created_at, content, views, upvotes, downvotes, commenter_color, commenter_emoji, upvote",
      )
      .lte("created_at", cutoff.toISOString())
      .range(start, end);

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
    await client.from("comment_views").upsert(
      {
        comment_id: comment.id,
      },
      {
        onConflict: "comment_id, viewer_id",
      },
    );
  };

  /**
   * Toggle a vote on a post
   * @param post Post to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const togglePostVote = async (post: Post, upvote: boolean) => {
    const oldPost = cloneDeep(post);
    let error: PostgrestError | null = null;

    // Upvote the post
    if (post.upvote !== true && upvote) {
      // Optimistically update the post
      setPost({
        ...post,
        upvotes: post.upvotes + 1,
        downvotes: post.upvote === false ? post.downvotes - 1 : post.downvotes,
        upvote: true,
      });

      // Upsert the vote
      ({error} = await client.from("post_votes").upsert(
        {
          post_id: post.id,
          upvote: true,
        },
        {
          onConflict: "post_id, voter_id",
        },
      ));
    }
    // Downvote the post
    else if (post.upvote !== false && !upvote) {
      // Optimistically update the post
      setPost({
        ...post,
        upvotes: post.upvote === true ? post.upvotes - 1 : post.upvotes,
        downvotes: post.downvotes + 1,
        upvote: false,
      });

      // Upsert the vote
      ({error} = await client.from("post_votes").upsert(
        {
          post_id: post.id,
          upvote: false,
        },
        {
          onConflict: "post_id, voter_id",
        },
      ));
    }
    // Delete the vote
    else {
      // Optimistically update the post
      setPost({
        ...post,
        upvotes: post.upvote === true ? post.upvotes - 1 : post.upvotes,
        downvotes: post.upvote === false ? post.downvotes - 1 : post.downvotes,
        upvote: null,
      });

      // Delete the vote
      ({error} = await client
        .from("post_votes")
        .delete()
        .eq("post_id", post.id));
    }

    // Handle error
    if (error !== null) {
      // Restore the post
      setPost(oldPost);

      return;
    }
  };

  /**
   * Toggle a vote on a comment
   * @param comment Comment to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const toggleCommentVote = async (comment: Comment, upvote: boolean) => {
    const oldComment = cloneDeep(comment);
    let error: PostgrestError | null = null;

    // Upvote the comment
    if (comment.upvote !== true && upvote) {
      // Optimistically update the comment
      setComment({
        ...comment,
        upvotes: comment.upvotes + 1,
        downvotes:
          comment.upvote === false ? comment.downvotes - 1 : comment.downvotes,
        upvote: true,
      });

      // Upsert the vote
      ({error} = await client.from("comment_votes").upsert(
        {
          comment_id: comment.id,
          upvote: true,
        },
        {
          onConflict: "comment_id, voter_id",
        },
      ));
    }
    // Downvote the comment
    else if (comment.upvote !== false && !upvote) {
      // Optimistically update the comment
      setComment({
        ...comment,
        upvotes:
          comment.upvote === true ? comment.upvotes - 1 : comment.upvotes,
        downvotes: comment.downvotes + 1,
        upvote: false,
      });

      // Upsert the vote
      ({error} = await client.from("comment_votes").upsert(
        {
          comment_id: comment.id,
          upvote: false,
        },
        {
          onConflict: "comment_id, voter_id",
        },
      ));
    }
    // Delete the vote
    else {
      // Optimistically update the comment
      setComment({
        ...comment,
        upvotes:
          comment.upvote === true ? comment.upvotes - 1 : comment.upvotes,
        downvotes:
          comment.upvote === false ? comment.downvotes - 1 : comment.downvotes,
        upvote: null,
      });

      // Delete the vote
      ({error} = await client
        .from("comment_votes")
        .delete()
        .eq("comment_id", comment.id));
    }

    // Handle error
    if (error !== null) {
      // Restore the comment
      setComment(oldComment);

      return;
    }
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
        contentItemKey="id"
        onContentItemViewed={onCommentViewed}
        contentItemRenderer={(comment, index, onLoad) => (
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
                className={`mb-2 mx-0 w-full ${index === 0 ? "mt-4" : "mt-2"}`}
                comment={comment}
                onLoad={onLoad}
                toggleVote={upvote => toggleCommentVote(comment, upvote)}
              />
            </IonItem>
          </SwipeableItem>
        )}
        fetchContent={fetchComments}
        onRefresh={onContentRefresh}
        header={
          <>
            <div className="px-4 w-full" ref={sizerRef} />

            {post !== undefined && (
              <SwipeableItem
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
                <IonItem lines="none">
                  <PostCard
                    className="mb-2 mt-4 mx-0 w-full"
                    post={post}
                    postLinkDetail={false}
                    width={width}
                    toggleVote={upvote => togglePostVote(post, upvote)}
                  />
                </IonItem>
              </SwipeableItem>
            )}
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
