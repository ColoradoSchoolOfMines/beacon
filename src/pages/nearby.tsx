/**
 * @file Nearby page
 */
/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */

import {
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
  IonMenuButton,
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
import {useHistory} from "react-router-dom";
import {useMeasure} from "react-use";
import {VList, VListHandle} from "virtua";

import {PostCard} from "~/components/post-card";
import {SwipeableItem} from "~/components/swipeable-item";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Post index range
 */
type PostRange = [number, number];

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
 * Post range span
 */
const POST_RANGE_SPAN = 9;

/**
 * Default post index range
 */
const DEFAULT_POST_RANGE: PostRange = [0, POST_RANGE_SPAN];

/**
 * Prefetch time multiplier
 */
const PREFETCH_TIME_MULTIPLIER = 1.2;

/**
 * Maximum number of scroll metadatas to keep
 */
const MAXIMUM_SCROLL_METADATAS = 10;

/**
 * Nearby page
 * @returns JSX
 */
export const Nearby: FC = () => {
  // Hooks
  const [posts, setPosts] = useState<Post[]>([]);

  const fetching = useRef(false);
  const postRange = useRef<PostRange>([...DEFAULT_POST_RANGE]);
  const [outOfPosts, setOutOfPosts] = useState(false);
  const postCutoffTimestamp = useRef<Date>(new Date());
  const fetchLatency = useRef(50);

  const virtualScroller = useRef<VListHandle>(null);
  const previousScrollMetadatas = useRef<ScrollMetadata[]>([]);
  const loadedPosts = useRef(new Set<string>());
  const viewedPosts = useRef(new Set<string>());

  const showFABs = usePersistentStore(state => state.showFABs);

  const registerRefreshContent = useEphemeralUIStore(
    state => state.registerRefreshContent,
  );

  const unregisterRefreshContent = useEphemeralUIStore(
    state => state.unregisterRefreshContent,
  );

  const history = useHistory();
  const [contentRef, {height}] = useMeasure<HTMLIonContentElement>();
  const [sizerRef, {width}] = useMeasure<HTMLDivElement>();

  // Effects
  useEffect(() => {
    // Fetch initial posts
    fetchPosts(...postRange.current, postCutoffTimestamp.current, true);

    // Register the refresh content function
    registerRefreshContent(refreshContent);

    return () => {
      // Unregister the refresh content function
      unregisterRefreshContent(refreshContent);
    };
  }, []);

  // Methods
  /**
   * Set the post
   * @param newPost New post
   * @returns Void
   */
  const setPost = (newPost: Post) =>
    setPosts(posts.map(post => (post.id === newPost.id ? newPost : post)));

  /**
   * Fetch posts
   * @param start Start index
   * @param end End index
   * @param cutoff Cutoff timestamp
   * @param append Whether to append the posts to the existing posts
   */
  const fetchPosts = async (
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

    // Get posts
    const startTime = Date.now();

    const {data, error} = await client
      .from("personalized_posts")
      .select(
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, distance, upvotes, downvotes, comments, poster_color, poster_emoji, upvote",
      )
      .lte("created_at", cutoff.toISOString())
      .range(start, end);

    const endTime = Date.now();

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Update the state
    setPosts([
      ...(append ? posts : []),
      ...(data as any),
    ]);

    setOutOfPosts(data.length < POST_RANGE_SPAN);
    postRange.current[0] = start;
    postRange.current[1] = end;
    postCutoffTimestamp.current = cutoff;
    fetchLatency.current = endTime - startTime;

    // Exit critical section
    fetching.current = false;
  };

  /**
   * Refresh content, discarding stale content
   */
  const refreshContent = async () => {
    // Fetch posts
    await fetchPosts(...DEFAULT_POST_RANGE, new Date(), false);

    // Reset scroll position
    virtualScroller.current?.scrollTo(0);
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
   * Create a post
   */
  const createPost = () => {
    // Go to the create post page
    history.push("/posts/create/1");
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
      !outOfPosts &&
      remainingTime > 0 &&
      PREFETCH_TIME_MULTIPLIER * remainingTime <= fetchLatency.current
    ) {
      // Fetch posts
      await fetchPosts(
        postRange.current[1] + 1,
        postRange.current[1] + POST_RANGE_SPAN + 1,
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
    // Check if all posts in range have been loaded
    let allLoaded = true;

    for (let i = start; i < end; i++) {
      const post = posts[i];

      // Skip if the post has already been loaded
      if (post === undefined || !loadedPosts.current.has(post.id)) {
        allLoaded = false;
        break;
      }
    }

    // Mark all posts in range as viewed
    if (allLoaded) {
      const results = [];

      for (let i = start; i < end; i++) {
        const post = posts[i]!;

        // Skip if the post has already been viewed
        if (viewedPosts.current.has(post.id)) {
          continue;
        }

        results.push(
          (async () => {
            // Insert the view
            const {error} = await client.from("post_views").upsert(
              {
                post_id: post.id,
              },
              {
                onConflict: "post_id, viewer_id",
              },
            );

            // Handle error
            if (error !== null) {
              return;
            }

            // Update the viewed posts
            viewedPosts.current.add(post.id);
          })(),
        );
      }

      await Promise.all(results);
    }
  };

  /**
   * Post load event handler
   * @param post Post
   */
  const onPostLoad = (post: Post) => {
    // Update the loaded posts
    loadedPosts.current.add(post.id);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Nearby</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="relative" scrollY={false} ref={contentRef}>
        <IonRefresher onIonRefresh={onRefresherRefresh} slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        <div className="px-4 w-full" ref={sizerRef} />

        <div className="flex flex-col h-full w-full">
          {posts.length > 0 ? (
            <VList
              className="bottom-0 ion-content-scroll-host left-0 overflow-y-auto right-0 top-0"
              onScroll={onScroll}
              onRangeChange={onRangeChange}
              style={{
                height,
              }}
              ref={virtualScroller}
            >
              {posts.map((post, index) => (
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
                      className={`mb-2 mx-0 w-full ${
                        index === 0 ? "mt-4" : "mt-2"
                      }`}
                      postLinkDetail={true}
                      width={width}
                      post={post}
                      onLoad={() => onPostLoad(post)}
                      toggleVote={upvote => togglePostVote(post, upvote)}
                    />
                  </IonItem>
                </SwipeableItem>
              ))}

              {posts.length > 0 && outOfPosts ? (
                <IonItem lines="none">
                  <p className="mt-6 mb-8 text-center text-xl w-full">
                    No more posts to see 😢
                    <br />
                    <button
                      aria-label="Refresh all posts"
                      onClick={refreshContent}
                    >
                      <u>Refresh</u>
                    </button>{" "}
                    the page to see new posts!
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
                  No posts to see 😢
                  <br />
                  Make a new posts to see it here!
                </p>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      {showFABs && (
        <IonFab slot="fixed" horizontal="end" vertical="bottom">
          <IonFabButton onClick={createPost}>
            <IonIcon ios={addOutline} md={addSharp} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};
