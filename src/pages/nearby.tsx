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
  IonItemOptions,
  IonItemSliding,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  ItemSlidingCustomEvent,
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
import {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useMeasure} from "react-use";
import {VList} from "virtua";

import {PostCard} from "~/components/post-card";
import {useMiscellaneousStore} from "~/lib/stores/miscellaneous";
import {useSettingsStore} from "~/lib/stores/settings";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Nearby page
 * @returns JSX
 */
export const Nearby: React.FC = () => {
  // Hooks
  const [posts, setPosts] = useState<Post[]>([]);

  const [previousRatios, setPreviousRatios] = useState<Record<string, number>>(
    {},
  );

  const history = useHistory();
  const [measured, {height}] = useMeasure<HTMLIonContentElement>();
  const showFABs = useSettingsStore(state => state.showFABs);
  const useSlidingActions = useSettingsStore(state => state.useSlidingActions);
  const setRefreshPosts = useMiscellaneousStore(state => state.setRefreshPosts);

  // Effects
  useEffect(() => {
    // Refresh posts
    refreshPosts();

    // Register the refresh posts function
    setRefreshPosts(refreshPosts);

    return () => {
      // Unregister the refresh posts function
      setRefreshPosts(undefined);
    };
  }, []);

  // Methods
  /**
   * Refresh posts
   */
  const refreshPosts = async () => {
    // Get posts
    const {data, error} = await client.from("personalized_posts").select(`*`);

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Update the state
    setPosts(data as any);
  };

  /**
   * Toggle a vote on the post
   * @param post Post to toggle the vote on
   * @param upvote Whether the vote is an upvote or a downvote
   */
  const toggleVote = async (post: Post, upvote: boolean) => {
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
    // Refresh posts
    await refreshPosts();

    // Complete the refresher
    event.detail.complete();
  };

  /**
   * Item sliding swipe event handler
   * @param post Post
   * @param event Item sliding custom event
   */
  const onItemSlidingSwipe = async (
    post: Post,
    event: ItemSlidingCustomEvent,
  ) => {
    if (!useSlidingActions) {
      return;
    }

    // Cast the detail
    const detail = event.detail as {
      amount: number;
      ratio: number;
    };

    // Get the previous ratio
    const previousRatio = previousRatios?.[post.id];

    // Upvote (Swiped left)
    if (
      previousRatio !== undefined &&
      detail.ratio <= -1 &&
      previousRatio < detail.ratio
    ) {
      await toggleVote(post, true);
      await event.target.closeOpened();
    }
    // Downvote (Swiped right)
    else if (
      previousRatio !== undefined &&
      detail.ratio >= 1 &&
      previousRatio > detail.ratio
    ) {
      await toggleVote(post, false);
      await event.target.closeOpened();
    }

    // Store the ratio
    setPreviousRatios({
      ...previousRatios,
      [post.id]: detail.ratio,
    });
  };

  /**
   * Set the post
   * @param newPost New post
   * @returns Void
   */
  const setPost = (newPost: Post) =>
    setPosts(posts.map(post => (post.id === newPost.id ? newPost : post)));

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

      <IonContent className="relative" scrollY={false} ref={measured}>
        <IonRefresher onIonRefresh={onRefresherRefresh} slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        <VList
          className="absolute bottom-0 ion-content-scroll-host left-0 overflow-y-auto right-0 top-0"
          // onRangeChange={}
          style={{
            height,
          }}
        >
          {posts.map((post, index) => (
            <IonItemSliding
              onIonDrag={event => onItemSlidingSwipe(post, event)}
              key={post.id}
            >
              {useSlidingActions && (
                <IonItemOptions side="start">
                  <IonItemOption color="success">
                    <IonIcon
                      slot="icon-only"
                      ios={arrowUpOutline}
                      md={arrowUpSharp}
                    />
                  </IonItemOption>
                </IonItemOptions>
              )}

              <IonItem lines="none">
                <PostCard
                  className={`mx-0 my-2 w-full ${index === 0 ? "mt-4" : ""} ${
                    index === posts.length - 1 ? "mb-4" : ""
                  }`}
                  post={post}
                  toggleVote={upvote => toggleVote(post, upvote)}
                />
              </IonItem>

              {useSlidingActions && (
                <IonItemOptions side="end">
                  <IonItemOption color="danger">
                    <IonIcon
                      slot="icon-only"
                      ios={arrowDownOutline}
                      md={arrowDownSharp}
                    />
                  </IonItemOption>
                </IonItemOptions>
              )}
            </IonItemSliding>
          ))}

          <IonInfiniteScroll>
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        </VList>

        {posts.length === 0 && (
          <div className="absolute left-0 right-0 bottom-0 top-0 flex flex-col h-full items-center justify-center text-center w-full z-10">
            <h1 className="text-8xl">😢</h1>
            <p className="mt-4 text-xl">
              No posts to see here :(
              <br />
              Make a new post to see it here!
            </p>
          </div>
        )}
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
