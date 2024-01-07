/**
 * @file Post card component
 */

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import {clamp} from "lodash-es";
import {useEffect, useState} from "react";
import {useWindowSize} from "react-use";

import {Avatar} from "~/components/Avatar";
import {Blurhash} from "~/components/Blurhash";
import {Markdown} from "~/components/Markdown";
import {client} from "~/lib/supabase";
import {MediaCategory, MediaDimensions, Post} from "~/lib/types";
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
  const {width} = useWindowSize();

  const [media, setMedia] = useState<
    | {
        category: MediaCategory;
        url: string;
      }
    | undefined
  >();

  const [size, setSize] = useState<MediaDimensions>({
    height: 0,
    width: 0,
  });

  // Effects
  useEffect(() => {
    // Clamp the width
    const clampedWidth = clamp(width, MIN_MEDIA_DIMENSION, MAX_MEDIA_DIMENSION);

    setSize(
      post.has_media
        ? {
            height: Math.round(
              clampedWidth / (post as Post<true>).aspect_ratio,
            ),
            width: clampedWidth,
          }
        : {
            height: 0,
            width: 0,
          },
    );
  }, [post, width]);

  useEffect(() => {
    (async () => {
      if (!post.has_media || size.height === 0 || size.width === 0) {
        setMedia(undefined);
        return;
      }

      // Load media
      const urls = [
        client.storage.from("media").getPublicUrl(`posts/${post.id}`, {
          transform: {
            quality: 90,
            height: size.height,
            width: size.width,
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
          break;
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
    })();
  }, [post, size]);

  return (
    <IonCard className="m-0 rounded-none w-full">
      {post.has_media && (
        <div
          className="relative"
          style={{
            height: size.height,
            width: size.width,
          }}
        >
          <Blurhash
            className="absolute"
            hash={(post as Post<true>).blur_hash}
            height={size.height}
            width={size.width}
          />
          {media !== undefined && (
            <div className="absolute animate-fade-in animate-duration-300 animate-ease-in-out">
              {(() => {
                switch (media.category) {
                  case MediaCategory.IMAGE:
                    return (
                      <img
                        alt="Post media"
                        height={size.height}
                        src={media.url}
                        width={size.width}
                      />
                    );

                  case MediaCategory.VIDEO:
                    return (
                      <video
                        autoPlay
                        controls
                        height={size.height}
                        loop
                        muted
                        src={media.url}
                        width={size.width}
                      />
                    );
                }
              })()}
            </div>
          )}
        </div>
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
