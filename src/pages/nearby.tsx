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
   * @param start Start index
   * @param end End index
   * @param cutoff Cutoff timestamp
   * @returns Posts
   */
  const fetchPosts = async (start: number, end: number, cutoff: Date) => {
    // Fetch posts
    const {data, error} = await client
      .from("personalized_posts")
      .select(
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, distance, upvotes, downvotes, comments, poster_color, poster_emoji, upvote",
      )
      .lte("created_at", cutoff.toISOString())
      .range(start, end);

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
        contentItemKey="id"
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
                className={`mb-2 mx-0 w-full ${index === 0 ? "mt-4" : "mt-2"}`}
                postLinkDetail={true}
                width={width}
                post={post}
                onLoad={onLoad}
                toggleVote={upvote => togglePostVote(post, upvote)}
              />
            </IonItem>
          </SwipeableItem>
        )}
        fetchContent={fetchPosts}
        fixedHeader={<div className="px-4 w-full" ref={sizerRef} />}
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
