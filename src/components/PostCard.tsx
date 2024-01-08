/**
 * @file Post card component
 */

import {IonButton, IonCard, IonCardContent, IonIcon} from "@ionic/react";
import {
  arrowDownOutline,
  arrowDownSharp,
  arrowUpOutline,
  arrowUpSharp,
  chatbubblesOutline,
  chatbubblesSharp,
  locationOutline,
  locationSharp,
  timeOutline,
  timeSharp,
} from "ionicons/icons";
import {clamp} from "lodash-es";
import {Duration} from "luxon";
import {useEffect, useState} from "react";
import {useMeasure} from "react-use";

import {Avatar} from "~/components/Avatar";
import {Blurhash} from "~/components/Blurhash";
import {Markdown} from "~/components/Markdown";
import styles from "~/components/PostCard.module.css";
import {
  getCategory,
  MAX_MEDIA_DIMENSION,
  MIN_MEDIA_DIMENSION,
} from "~/lib/media";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {MediaCategory, MediaDimensions, Post} from "~/lib/types";
import {formatDistance, formatDuration, formatScalar} from "~/lib/utils";

/**
 * Post card component props
 */
interface PostCardProps {
  /**
   * Post
   */
  post: Post;

  /**
   * Set the post
   * @param newPost New post
   */
  setPost: (newPost: Post) => void;
}

/**
 * Post card component
 * @param props Props
 * @returns JSX
 */
export const PostCard: React.FC<PostCardProps> = ({post, setPost}) => {
  // Hooks
  const [time, setTime] = useState<string | undefined>();

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

  const showAmbientEffect = useStore(state => state.showAmbientEffect);
  const measurementSystem = useStore(state => state.measurementSystem);
  const [measured, {width}] = useMeasure<HTMLDivElement>();

  // Effects
  useEffect(() => {
    // Recompute ago every five seconds
    updateAgo();
    setInterval(updateAgo, 5000);
  }, []);

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
        res = await fetch(url);

        if (res.ok) {
          break;
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

      // Create an object URL for the blob
      const url = URL.createObjectURL(blob);

      setMedia({
        category,
        url,
      });
    })();
  }, [post, size]);

  // Methods
  /**
   * Update the ago time
   */
  const updateAgo = () => {
    const duration = Date.now() - new Date(post.created_at).getTime();

    setTime(
      Duration.fromMillis(duration).as("days") < 1
        ? `${formatDuration(duration)} ago`
        : new Date(post.created_at).toLocaleDateString(),
    );
  };

  /**
   * Toggle the upvote on the post
   */
  const toggleUpvote = async () => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (post.upvote === true) {
      // Delete the vote
      await client.from("post_votes").delete().match({
        // eslint-disable-next-line camelcase
        post_id: post.id,
      });

      // Optimistically update the post
      setPost({
        ...post,
        upvotes: post.upvotes - 1,
        // eslint-disable-next-line unicorn/no-null
        upvote: null,
      });
    } else {
      // Create the vote
      await client.from("post_votes").insert({
        // eslint-disable-next-line camelcase
        post_id: post.id,
        upvote: true,
      });

      // Optimistically update the post
      setPost({
        ...post,
        upvotes: post.upvotes + 1,
        upvote: true,
      });
    }
  };

  /**
   * Toggle the downvote on the post
   */
  const toggleDownvote = async () => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (post.upvote === false) {
      // Delete the vote
      await client.from("post_votes").delete().match({
        // eslint-disable-next-line camelcase
        post_id: post.id,
      });

      // Optimistically update the post
      setPost({
        ...post,
        downvotes: post.downvotes - 1,
        // eslint-disable-next-line unicorn/no-null
        upvote: null,
      });
    } else {
      // Create the vote
      await client.from("post_votes").insert({
        // eslint-disable-next-line camelcase
        post_id: post.id,
        upvote: false,
      });

      // Optimistically update the post
      setPost({
        ...post,
        downvotes: post.downvotes + 1,
        upvote: false,
      });
    }
  };

  return (
    <IonCard className="mx-4 my-2 rounded-xl overflow-hidden text-neutral-700 dark:text-neutral-300">
      <div className="w-full" ref={measured} />

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
            ambient={showAmbientEffect}
            hash={(post as Post<true>).blur_hash}
            height={size.height}
            width={size.width}
          />
          {media !== undefined && (
            <div className="absolute animate-fade-in animate-duration-500">
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

      <IonCardContent className="p-4">
        <div className="flex flex-row items-center justify-between w-full">
          <Avatar
            profile={{
              emoji: post.poster_emoji,
              color: post.poster_color,
            }}
          />

          <div className="flex flex-row items-center justify-center h-full">
            <IonIcon
              className="text-[1.4rem]"
              ios={locationOutline}
              md={locationSharp}
            />
            <p className="!mb-0 !ml-1.5 !mr-4 !mt-0.5">
              {formatDistance(post.distance, measurementSystem)} away
            </p>

            {time !== undefined && (
              <>
                <IonIcon
                  className="text-[1.4rem]"
                  ios={timeOutline}
                  md={timeSharp}
                />
                <p className="!mb-0 !ml-1.5 !mt-0.5">{time}</p>
              </>
            )}
          </div>
        </div>

        <Markdown className="mt-4 mb-1" raw={post.content} />

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center justify-center px-1">
            <IonIcon
              className="text-[1.8rem]"
              slot="start"
              ios={chatbubblesOutline}
              md={chatbubblesSharp}
            />
            <p className="!mb-0 !ml-1.5">{formatScalar(post.comments)}</p>
          </div>

          <div className="flex flex-row items-center">
            <IonButton
              className={`m-0 ${styles.voteButton}`}
              color={post.upvote === true ? "success" : "medium"}
              fill="clear"
              onClick={toggleUpvote}
            >
              <IonIcon
                slot="icon-only"
                ios={arrowUpOutline}
                md={arrowUpSharp}
              />
            </IonButton>
            <p className="!mb-0 !mx-1.5">
              {formatScalar(post.upvotes - post.downvotes)}
            </p>
            <IonButton
              className={`m-0 ${styles.voteButton}`}
              color={post.upvote === false ? "danger" : "medium"}
              fill="clear"
              onClick={toggleDownvote}
            >
              <IonIcon
                slot="icon-only"
                ios={arrowDownOutline}
                md={arrowDownSharp}
              />
            </IonButton>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
