/**
 * @file Post card component
 */

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonRouterLink,
} from "@ionic/react";
import {
  arrowDownOutline,
  arrowDownSharp,
  arrowUpOutline,
  arrowUpSharp,
  chatbubblesOutline,
  chatbubblesSharp,
  ellipsisVerticalOutline,
  ellipsisVerticalSharp,
  eyeOutline,
  eyeSharp,
  locationOutline,
  locationSharp,
  shareSocialOutline,
  shareSocialSharp,
  timeOutline,
  timeSharp,
  warningOutline,
  warningSharp,
} from "ionicons/icons";
import {Duration} from "luxon";
import {
  FC,
  HTMLAttributes,
  MouseEvent,
  useEffect,
  useId,
  useState,
} from "react";
import {useHistory} from "react-router-dom";

import {Avatar} from "~/components/avatar";
import {Blurhash} from "~/components/blurhash";
import {Markdown} from "~/components/markdown";
import styles from "~/components/post-card.module.css";
import {getCategory} from "~/lib/media";
import {useMiscellaneousStore} from "~/lib/stores/miscellaneous";
import {useSettingsStore} from "~/lib/stores/settings";
import {client} from "~/lib/supabase";
import {MediaCategory, Post} from "~/lib/types";
import {formatDistance, formatDuration, formatScalar} from "~/lib/utils";

/**
 * Post card component props
 */
interface PostCardProps extends HTMLAttributes<HTMLIonCardElement> {
  /**
   * Post
   */
  post: Post;

  /**
   * Whether or not the post will link to the post detail page
   */
  postLinkDetail: boolean;

  /**
   * Post card width
   */
  width: number;

  /**
   * Post load event handler
   */
  onLoad?: () => void;

  /**
   * Toggle a vote on the post
   * @param upvote Whether the vote is an upvote or a downvote
   */
  toggleVote: (upvote: boolean) => void;
}

/**
 * Post card component
 * @param props Props
 * @returns JSX
 */
export const PostCard: FC<PostCardProps> = ({
  post,
  postLinkDetail,
  width,
  onLoad,
  toggleVote,
  ...props
}) => {
  // Variables
  const height = post.has_media
    ? Math.round(width / (post as Post<true>).aspect_ratio)
    : 0;

  const AvatarContainer = post.poster_id === null ? "div" : IonRouterLink;

  // Hooks
  const id = useId();
  const [time, setTime] = useState<string | undefined>();

  const [media, setMedia] = useState<
    | {
        category: MediaCategory;
        url: string;
      }
    | undefined
  >();

  const history = useHistory();

  const setMessage = useMiscellaneousStore(state => state.setMessage);
  const showAmbientEffect = useSettingsStore(state => state.showAmbientEffect);
  const measurementSystem = useSettingsStore(state => state.measurementSystem);

  // Effects
  useEffect(() => {
    // Recompute ago every five seconds
    updateAgo();
    setInterval(updateAgo, 5000);
  }, []);

  useEffect(() => {
    (async () => {
      if (!post.has_media) {
        setMedia(undefined);

        if (!post.has_media) {
          onLoad?.();
        }

        return;
      }

      // Load media
      const urls = [
        client.storage.from("media").getPublicUrl(`posts/${post.id}`, {
          transform: {
            quality: 90,
            height: height,
            width: width,
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

      // Emit the load event
      onLoad?.();
    })();
  }, [post]);

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
   * Share the post
   */
  const share = async () => {
    // Generate the URL
    const url = new URL(`/posts/${post.id}`, window.location.origin).toString();

    // Share
    await (navigator.share === undefined
      ? navigator.clipboard.writeText(url)
      : navigator.share({
          url,
        }));

    // Display the message
    setMessage({
      name: "Copied link",
      description: "The link to the post has been copied to your clipboard.",
    });
  };

  /**
   * Report the post
   */
  const report = async () => {
    // Insert the report
    const {error} = await client.from("post_reports").insert({
      // eslint-disable-next-line camelcase
      post_id: post.id,
    });

    // Handle error
    if (error !== null) {
      if (error.code === "23505") {
        // Display the message
        setMessage({
          name: "Reported post",
          description: "The post has already been reported.",
        });
      }

      return;
    }

    // Display the message
    setMessage({
      name: "Reported post",
      description: "The post has been reported. Thank you for your feedback.",
    });
  };

  /**
   * Card click event handler
   * @param event Event
   */
  const onCardClick = (event: MouseEvent<HTMLIonCardElement>) => {
    if (event.defaultPrevented || !postLinkDetail) {
      return;
    }

    // Go to the post detail page
    history.push(`/posts/${post.id}`);
  };

  return (
    <IonCard
      {...props}
      onClick={onCardClick}
      className={`cursor-pointer dark:text-neutral-300 overflow-hidden rounded-xl text-neutral-700 ${
        props.className ?? ""
      }`}
    >
      {post.has_media && (
        <div
          className="relative"
          style={{
            height,
            width,
          }}
        >
          <Blurhash
            className="absolute"
            ambient={showAmbientEffect}
            hash={(post as Post<true>).blur_hash}
            height={height}
            width={width}
          />
          {media !== undefined && (
            <div className="absolute animate-fade-in animate-duration-500">
              {(() => {
                switch (media.category) {
                  case MediaCategory.IMAGE:
                    return (
                      <img
                        alt="Post media"
                        height={height}
                        src={media.url}
                        width={width}
                      />
                    );

                  case MediaCategory.VIDEO:
                    return (
                      <video
                        autoPlay
                        height={height}
                        loop
                        muted
                        src={media.url}
                        width={width}
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
          <AvatarContainer
            className="h-10 w-10"
            {...(post.poster_id === null
              ? {}
              : {
                  routerLink: `/users/${post.poster_id}`,
                })}
          >
            <Avatar
              profile={{
                emoji: post.poster_emoji ?? undefined,
                color: post.poster_color ?? undefined,
              }}
            />
          </AvatarContainer>

          <div className="flex flex-row items-center justify-center h-full">
            <IonIcon className="text-[1.4rem]" ios={eyeOutline} md={eyeSharp} />
            <p className="!mb-0 !ml-1.5 !mr-4 !mt-0.5">
              {formatScalar(post.views)}
            </p>

            <IonIcon
              className="text-[1.4rem]"
              ios={locationOutline}
              md={locationSharp}
            />
            <p className="!mb-0 !ml-1.5 !mr-4 !mt-0.5">
              {formatDistance(post.distance, measurementSystem)}
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
              className="text-[1.4rem]"
              color="medium"
              slot="start"
              ios={chatbubblesOutline}
              md={chatbubblesSharp}
            />
            <p className="!mb-0 !ml-1.5">{formatScalar(post.comments)}</p>
          </div>

          <div className="flex flex-row items-center">
            <IonButton
              className={`m-0 ${styles.iconButton}`}
              color={post.upvote === true ? "success" : "medium"}
              fill="clear"
              onClick={event => {
                event.preventDefault();
                toggleVote(true);
              }}
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
              className={`m-0 ${styles.iconButton}`}
              color={post.upvote === false ? "danger" : "medium"}
              fill="clear"
              onClick={event => {
                event.preventDefault();
                toggleVote(false);
              }}
            >
              <IonIcon
                slot="icon-only"
                ios={arrowDownOutline}
                md={arrowDownSharp}
              />
            </IonButton>

            <IonButton
              className={`m-0 ml-1.5 ${styles.iconButton}`}
              color="medium"
              fill="clear"
              onClick={event => event.preventDefault()}
              id={`${id}-options`}
            >
              <IonIcon
                className="text-[1.4rem]"
                slot="icon-only"
                ios={ellipsisVerticalOutline}
                md={ellipsisVerticalSharp}
              />
            </IonButton>
            <IonPopover trigger={`${id}-options`} triggerAction="click">
              <IonList>
                <IonItem>
                  <IonButton
                    className="w-full"
                    fill="clear"
                    onClick={event => {
                      event.preventDefault();
                      share();
                    }}
                  >
                    <IonIcon
                      slot="start"
                      ios={shareSocialOutline}
                      md={shareSocialSharp}
                    />
                    Share
                  </IonButton>
                </IonItem>

                <IonItem lines="none">
                  <IonButton
                    className="w-full"
                    color="danger"
                    fill="clear"
                    onClick={event => {
                      event.preventDefault();
                      report();
                    }}
                  >
                    <IonIcon
                      slot="start"
                      ios={warningOutline}
                      md={warningSharp}
                    />
                    Report
                  </IonButton>
                </IonItem>
              </IonList>
            </IonPopover>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
