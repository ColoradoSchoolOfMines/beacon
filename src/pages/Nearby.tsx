/**
 * @file Nearby page
 */

import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {addOutline, addSharp} from "ionicons/icons";
import {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";

import {PostCard} from "~/components/PostCard";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Nearby page
 * @returns JSX
 */
export const Nearby: React.FC = () => {
  // Hooks
  const history = useHistory();
  const [posts, setPosts] = useState<Post[]>([]);
  const showFABs = useStore(state => state.showFABs);

  // Effects
  useEffect(() => {
    (async () => {
      // Get posts
      const {data, error} = await client.from("personalized_posts").select(`*`);

      // Handle error
      if (data === null || error !== null) {
        return;
      }

      // setPosts(data as any);
      if (data?.length > 0) {
        setPosts(Array.from({length: 1}).fill(data[0]) as any);
      }
    })();
  }, []);

  // Methods
  /**
   * Create a post
   */
  const createPost = () => {
    // Go to the create post page
    history.push("/posts/create");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Nearby</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        {posts.length > 0 ? (
          <IonList className="py-0">
            {posts.map((post, index) => (
              <PostCard
                /* key={post.id} */
                key={index}
                post={post}
              />
            ))}

            <IonInfiniteScroll>
              <IonInfiniteScrollContent />
            </IonInfiniteScroll>
          </IonList>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-center w-full">
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
