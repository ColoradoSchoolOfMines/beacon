/**
 * @file Nearby page
 */

import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import {useEffect, useState} from "react";

import {Header} from "~/components/Header";
import {PostCard} from "~/components/PostCard";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Nearby page
 * @returns JSX
 */
export const Nearby: React.FC = () => {
  // Hooks
  const [posts, setPosts] = useState<Post[]>([]);

  // Effects
  useEffect(() => {
    (async () => {
      // Get posts
      const {data, error} = await client.from("public_posts").select("*");

      // Handle error
      if (data === null || error !== null) {
        return;
      }

      setPosts(data as any);
    })();
  }, []);

  return (
    <IonPage>
      <Header />

      <IonContent forceOverscroll={false} fullscreen={true}>
        <IonRefresher slot="fixed">
          <IonRefresherContent />
        </IonRefresher>

        {posts.length > 0 && (
          <IonList>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}

            <IonInfiniteScroll>
              <IonInfiniteScrollContent />
            </IonInfiniteScroll>
          </IonList>
        )}
        {posts.length === 0 && (
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
    </IonPage>
  );
};
