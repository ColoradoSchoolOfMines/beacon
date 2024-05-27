/**
 * @file Nearby page
 */
/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */

import {
  IonButtons,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonMenuButton,
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
import {FC, useState} from "react";
import {useHistory} from "react-router-dom";
import {useMeasure} from "react-use";

import {PostCard} from "~/components/post-card";
import {ScrollableContent} from "~/components/scrollable-content";
import {SwipeableItem} from "~/components/swipeable-item";
import {insertView, toggleVote} from "~/lib/entities";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Nearby page
 * @returns JSX
 */
export const Nearby: FC = () => {
  // Hooks
  const [posts, setPosts] = useState<Post[]>([]);
  const waitForLocation = useEphemeralStore(state => state.waitForLocation);
  const showFABs = usePersistentStore(state => state.showFABs);
  const [sizerRef, {width}] = useMeasure<HTMLDivElement>();
  const history = useHistory();

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
   * @param limit Posts limit
   * @param cutoffRank Cutoff rank or undefined for no cutoff
   * @returns Posts
   */
  const fetchPosts = async (limit: number, cutoffRank?: number) => {
    // Wait for a location
    await waitForLocation();

    // Build the query
    let query = client
      .from("personalized_posts")
      .select(
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, upvotes, downvotes, comments, distance, rank, is_mine, poster_color, poster_emoji, upvote",
      );

    if (cutoffRank !== undefined) {
      query = query.lt("rank", cutoffRank);
    }

    query = query.order("rank", {ascending: false}).limit(limit);

    // Fetch posts
    const {data, error} = await query;

    // Handle error
    if (data === null || error !== null) {
      return [];
    }

    return data as Post[];
  };

  /**
   * Post view event handler
   * @param post Post that was viewed
   */
  const onPostViewed = async (post: Post) => {
    // Insert the view
    await insertView("post_views", "post_id", post.id);
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

    // Remove the post from the state
    setPosts(posts.filter(p => p.id !== post.id));
  };

  /**
   * Create a post
   */
  const createPost = () => {
    // Go to the create post page
    history.push("/posts/create/1");
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

      <ScrollableContent
        contentItemName="post"
        contentItems={posts}
        setContentItems={setPosts}
        contentItemIDKey="id"
        contentItemRankKey="rank"
        onContentItemViewed={onPostViewed}
        contentItemRenderer={(post, index, onLoad) => (
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
                className={`max-w-256 mb-2 mx-auto w-full ${index === 0 ? "mt-4" : "mt-2"}`}
                postLinkDetail={true}
                width={width}
                post={post}
                onLoad={onLoad}
                toggleVote={upvote => togglePostVote(post, upvote)}
                onDeleted={post.is_mine ? () => deletePost(post) : undefined}
              />
            </IonItem>
          </SwipeableItem>
        )}
        fetchContent={fetchPosts}
        header={
          <IonItem className="h-0" lines="none">
            <div className="max-w-256 w-full" ref={sizerRef} />
          </IonItem>
        }
      />

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
