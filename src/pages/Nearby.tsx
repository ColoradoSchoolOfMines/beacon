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
import {useMeasure} from "react-use";
import {VList} from "virtua";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const showFABs = useStore(state => state.showFABs);
  const history = useHistory();
  const [measured, {height}] = useMeasure<HTMLIonContentElement>();

  // Effects
  useEffect(() => {
    (async () => {
      // Get posts
      const {data, error} = await client.from("personalized_posts").select(`*`);

      // Handle error
      if (data === null || error !== null) {
        return;
      }

      setPosts(data as any);
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
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Nearby</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="relative" scrollY={false} ref={measured}>
        <IonRefresher slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        <VList
          className="absolute bottom-0 ion-content-scroll-host left-0 overflow-y-auto py-2 right-0 top-0"
          style={{
            height,
          }}
        >
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
