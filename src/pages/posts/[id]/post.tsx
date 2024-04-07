/**
 * @file Individual post page
 */
/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonItemOption,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
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
import {FC, useEffect, useRef, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {useMeasure} from "react-use";
import {VList, VListHandle} from "virtua";

import {CommentCard} from "~/components/comment-card";
import {PostCard} from "~/components/post-card";
import {SwipeableItem} from "~/components/swipeable-item";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Comment as DBComment, Post as DBPost} from "~/lib/types";

/**
 * Comment index range
 */
type CommentRange = [number, number];

/**
 * Scroll metadata
 */
interface ScrollMetadata {
  /**
   * Scroll offset
   */
  offset: number;

  /**
   * Timestamp
   */
  timestamp: number;
}

/**
 * Comment range span
 */
const COMMENT_RANGE_SPAN = 9;

/**
 * Default comment index range
 */
const DEFAULT_COMMENT_RANGE: CommentRange = [0, COMMENT_RANGE_SPAN];

/**
 * Prefetch time multiplier
 */
const PREFETCH_TIME_MULTIPLIER = 1.2;

/**
 * Maximum number of scroll metadatas to keep
 */
const MAXIMUM_SCROLL_METADATAS = 10;

/**
 * Individual post page
 * @returns JSX
 */
export const Post: FC = () => {
  // Hooks
  const [post, setPost] = useState<DBPost | undefined>();
  const [comments, setComments] = useState<DBComment[]>([]);

  const fetching = useRef(false);
  const commentRange = useRef<CommentRange>([...DEFAULT_COMMENT_RANGE]);
  const [outOfComments, setOutOfComments] = useState(false);
  const commentCutoffTimestamp = useRef<Date>(new Date());
  const fetchLatency = useRef(50);

  const virtualScroller = useRef<VListHandle>(null);
  const previousScrollMetadatas = useRef<ScrollMetadata[]>([]);
  const loadedComments = useRef(new Set<string>());
  const viewedComments = useRef(new Set<string>());

  const showFABs = usePersistentStore(state => state.showFABs);

  const registerRefreshContent = useEphemeralUIStore(
    state => state.registerRefreshContent,
  );

  const unregisterRefreshContent = useEphemeralUIStore(
    state => state.unregisterRefreshContent,
  );

  const params = useParams<{id: string}>();
  const history = useHistory();
  const [contentRef, {height}] = useMeasure<HTMLIonContentElement>();
  const [sizerRef, {width}] = useMeasure<HTMLDivElement>();

  // Effects
  useEffect(() => {
    // Fetch the post
    fetchPost();

    // Fetch initial comments
    fetchComments(
      ...commentRange.current,
      commentCutoffTimestamp.current,
      true,
    );

    // Register the refresh content function
    registerRefreshContent(refreshContent);

    return () => {
      // Unregister the refresh content function
      unregisterRefreshContent(refreshContent);
    };
  }, []);

  // Methods
  /**
   * Set the comment
   * @param newComment New comment
   * @returns Void
   */
  const setComment = (newComment: DBComment) =>
    setComments(
      comments.map(comment =>
        comment.id === newComment.id ? newComment : comment,
      ),
    );

  /**
   * Fetch the post
   */
  const fetchPost = async () => {
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
   * Fetch comments
   * @param start Start index
   * @param end End index
   * @param cutoff Cutoff timestamp
   * @param append Whether to append the comments to the existing comments
   */
  const fetchComments = async (
    start: number,
    end: number,
    cutoff: Date,
    append: boolean,
  ) => {
    // Enter critical section
    if (fetching.current) {
      return;
    }

    fetching.current = true;

    // Get comments
    const startTime = Date.now();

    const {data, error} = await client
      .from("personalized_comments")
      .select(
        "id, commenter_id, post_id, parent_id, created_at, content, views, upvotes, downvotes, commenter_color, commenter_emoji, upvote",
      )
      .lte("created_at", cutoff.toISOString())
      .range(start, end);

    const endTime = Date.now();

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Update the state
    setComments([
      ...(append ? comments : []),
      ...(data as any),
    ]);

    setOutOfComments(data.length < COMMENT_RANGE_SPAN);
    commentRange.current[0] = start;
    commentRange.current[1] = end;
    commentCutoffTimestamp.current = cutoff;
    fetchLatency.current = endTime - startTime;

    // Exit critical section
    fetching.current = false;
  };

  /**
   * Refresh content, discarding stale content
   */
  const refreshContent = async () => {
    await Promise.all([
      // Fetch the post
      fetchPost(),

      // Fetch comments
      fetchComments(...DEFAULT_COMMENT_RANGE, new Date(), false),
    ]);

    // Reset scroll position
    virtualScroller.current?.scrollTo(0);
  };

  /**
   * Toggle a vote on a post
   * @param post Post to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const togglePostVote = async (post: DBPost, upvote: boolean) => {
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
  const toggleCommentVote = async (comment: DBComment, upvote: boolean) => {
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

  /**
   * Refresher refresh event handler
   * @param event Refresher refresh event
   */
  const onRefresherRefresh = async (
    event: CustomEvent<RefresherEventDetail>,
  ) => {
    // Refresh content
    await refreshContent();

    // Complete the refresher
    event.detail.complete();
  };

  /**
   * Scroll event handler
   * @param offset Offset
   */
  const onScroll = async (offset: number) => {
    if (virtualScroller.current === null) {
      return;
    }

    // Update the previous scroll metadata
    previousScrollMetadatas.current.push({
      offset,
      timestamp: Date.now(),
    });

    if (previousScrollMetadatas.current.length > MAXIMUM_SCROLL_METADATAS) {
      previousScrollMetadatas.current = previousScrollMetadatas.current.slice(
        -MAXIMUM_SCROLL_METADATAS,
      );
    }

    // Calculate the remaining scroll distance (In pixels)
    const remainingDistance =
      virtualScroller.current.scrollSize -
      virtualScroller.current.viewportSize -
      offset;

    // Calculate the velocity (In pixels/millisecond)
    let velocity = 0;

    for (let i = 1; i < previousScrollMetadatas.current.length; i++) {
      const a = previousScrollMetadatas.current[i - 1]!;
      const b = previousScrollMetadatas.current[i]!;

      velocity += (b.offset - a.offset) / (b.timestamp - a.timestamp);
    }

    // Calculate the estimated time to scroll to the bottom (In milliseconds)
    const remainingTime = remainingDistance / velocity;

    if (
      !outOfComments &&
      remainingTime > 0 &&
      PREFETCH_TIME_MULTIPLIER * remainingTime <= fetchLatency.current
    ) {
      // Fetch comments
      await fetchComments(
        commentRange.current[1] + 1,
        commentRange.current[1] + COMMENT_RANGE_SPAN + 1,
        new Date(),
        true,
      );
    }
  };

  /**
   * Range change event handler
   * @param start Start index
   * @param end End index
   */
  const onRangeChange = async (start: number, end: number) => {
    // Check if all comments in range have been loaded
    let allLoaded = true;

    for (let i = start; i < end; i++) {
      const comment = comments[i];

      // Skip if the comment has already been loaded
      if (comment === undefined || !loadedComments.current.has(comment.id)) {
        allLoaded = false;
        break;
      }
    }

    // Mark all comments in range as viewed
    if (allLoaded) {
      const results = [];

      for (let i = start; i < end; i++) {
        const comment = comments[i]!;

        // Skip if the comment has already been viewed
        if (viewedComments.current.has(comment.id)) {
          continue;
        }

        results.push(
          (async () => {
            // Insert the view
            const {error} = await client.from("comment_views").upsert(
              {
                comment_id: comment.id,
              },
              {
                onConflict: "comment_id, viewer_id",
              },
            );

            // Handle error
            if (error !== null) {
              return;
            }

            // Update the viewed comments
            viewedComments.current.add(comment.id);
          })(),
        );
      }

      await Promise.all(results);
    }
  };

  /**
   * Comment load event handler
   * @param comment Comment
   */
  const onCommentLoad = (comment: DBComment) => {
    // Update the loaded comments
    loadedComments.current.add(comment.id);
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

      <IonContent className="relative" scrollY={false} ref={contentRef}>
        <IonRefresher onIonRefresh={onRefresherRefresh} slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        <div className="px-4 w-full" ref={sizerRef} />

        <div className="flex flex-col h-full w-full">
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

          {comments.length > 0 ? (
            <VList
              className="bottom-0 ion-content-scroll-host left-0 overflow-y-auto right-0 top-0"
              onScroll={onScroll}
              onRangeChange={onRangeChange}
              style={{
                height,
              }}
              ref={virtualScroller}
            >
              {comments.map((comment, index) => (
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
                      className={`mb-2 mx-0 w-full ${
                        index === 0 ? "mt-4" : "mt-2"
                      }`}
                      comment={comment}
                      onLoad={() => onCommentLoad(comment)}
                      toggleVote={upvote => toggleCommentVote(comment, upvote)}
                    />
                  </IonItem>
                </SwipeableItem>
              ))}

              {comments.length > 0 && outOfComments ? (
                <IonItem lines="none">
                  <p className="mt-6 mb-8 text-center text-xl w-full">
                    No more comments to see 😢
                    <br />
                    <button
                      aria-label="Refresh all comments"
                      onClick={refreshContent}
                    >
                      <u>Refresh</u>
                    </button>{" "}
                    the page to see new comments!
                  </p>
                </IonItem>
              ) : (
                <IonInfiniteScroll>
                  <IonInfiniteScrollContent />
                </IonInfiniteScroll>
              )}
            </VList>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className=" text-center">
                <h1 className="text-8xl">😢</h1>
                <p className="mt-4 text-xl">
                  No comments to see 😢
                  <br />
                  Make a new comment to see it here!
                </p>
              </div>
            </div>
          )}
        </div>
      </IonContent>

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
