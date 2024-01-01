/**
 * @file Post card component
 */

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import {useEffect, useState} from "react";

import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";

/**
 * Post card component props
 */
interface PostProps {
  /**
   * Post
   */
  post: Post;
}

/**
 * Post card component
 * @param props Props
 * @returns JSX
 */
export const PostCard: React.FC<PostProps> = ({post}) => {
  // Hooks
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();

  // Effects
  useEffect(() => {
    if (post.has_media) {
      setMediaUrl(
        client.storage.from("media").getPublicUrl(`posts/${post.id}`).data
          .publicUrl,
      );
    } else {
      setMediaUrl(undefined);
    }
  }, [post]);

  return (
    <IonCard className="m-0 rounded-none">
      {mediaUrl !== undefined && (
        <img
          alt="Post media"
          className="object-contain <md:w-full mx-auto"
          src={mediaUrl}
        />
      )}
      <IonCardHeader>
        <IonCardTitle></IonCardTitle>
        <IonCardSubtitle>Y</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cill.
      </IonCardContent>
    </IonCard>
  );
};
