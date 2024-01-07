/**
 * @file Post card component
 */

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSkeletonText,
} from "@ionic/react";
import {clamp} from "lodash-es";
import {useEffect, useState} from "react";
import {useWindowSize} from "react-use";

import {Avatar} from "~/components/Avatar";
import {Markdown} from "~/components/Markdown";
import {client} from "~/lib/supabase";
import {MediaCategory, Post} from "~/lib/types";
import {
  createDataURL,
  getCategory,
  MAX_MEDIA_DIMENSION,
  MIN_MEDIA_DIMENSION,
} from "~/lib/utils";

/**
 * Post card component props
 */
interface PostCardProps {
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
export const PostCard: React.FC<PostCardProps> = ({post}) => {
  // Hooks
  const [media, setMedia] = useState<
    | {
        category: MediaCategory;
        url: string;
      }
    | undefined
  >();

  const {height, width} = useWindowSize();

  // Effects
  useEffect(() => {
    (async () => {
      // Load media
      if (post.has_media) {
        const urls = [
          client.storage.from("media").getPublicUrl(`posts/${post.id}`, {
            transform: {
              quality: 90,
              height: clamp(height, MIN_MEDIA_DIMENSION, MAX_MEDIA_DIMENSION),
              width: clamp(width, MIN_MEDIA_DIMENSION, MAX_MEDIA_DIMENSION),
            },
          }).data.publicUrl,
          client.storage.from("media").getPublicUrl(`posts/${post.id}`).data
            .publicUrl,
        ];

        // Fetch the media
        let res: Response | undefined;

        for (const url of urls) {
          try {
            res = await fetch(url);
          } catch {
            // Do nothing
          }
        }

        if (res === undefined) {
          setMedia(undefined);
          return;
        }

        const blob = await res.blob();

        // Get the category
        const category = getCategory(blob.type);

        if (category === undefined) {
          setMedia(undefined);
          return;
        }

        // Create a data URL for the blob
        const url = await createDataURL(blob);

        setMedia({
          category,
          url,
        });
      } else {
        setMedia(undefined);
      }
    })();
  }, [
    height,
    width,
    post,
  ]);

  return (
    <IonCard className="m-0 rounded-none">
      {media !== undefined &&
        (() => {
          switch (media.category) {
            case MediaCategory.IMAGE:
              return (
                <img
                  alt="Post media"
                  className="object-contain <md:w-full mx-auto"
                  src={media.url}
                />
              );

            case MediaCategory.VIDEO:
              return (
                <video
                  autoPlay
                  className="object-contain <md:w-full mx-auto"
                  controls
                  loop
                  muted
                  src={media.url}
                />
              );
          }
        })()}
      {post.has_media && media === undefined && (
        <IonSkeletonText animated className="h-10 m-0" />
      )}
      <IonCardHeader>
        <IonCardTitle>
          <Avatar
            profile={{
              emoji: post.poster_emoji,
              color: post.poster_color,
            }}
          />
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <Markdown raw={post.content} />
      </IonCardContent>
    </IonCard>
  );
};
