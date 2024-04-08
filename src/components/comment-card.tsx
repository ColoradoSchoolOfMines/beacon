/**
 * @file Comment card component
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
  ellipsisVerticalOutline,
  ellipsisVerticalSharp,
  shareSocialOutline,
  shareSocialSharp,
  timeOutline,
  timeSharp,
  warningOutline,
  warningSharp,
} from "ionicons/icons";
import {Duration} from "luxon";
import {FC, HTMLAttributes, useEffect, useId, useState} from "react";

import {Avatar} from "~/components/avatar";
import styles from "~/components/comment-card.module.css";
import {Markdown} from "~/components/markdown";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {client} from "~/lib/supabase";
import {Comment, GlobalMessageMetadata} from "~/lib/types";
import {formatDuration, formatScalar} from "~/lib/utils";

/**
 * Copied link message metadata
 */
const COPIED_LINK_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("comment-card.copied-link"),
  name: "Copied link",
  description: "The link to the comment has been copied to your clipboard.",
};

/**
 * Already reported message metadata
 */
const ALREADY_REPORTED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("comment-card.already-reported"),
  name: "Already reported",
  description: "The comment has already been reported.",
};

/**
 * New report message metadata
 */
const NEW_REPORT_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("comment-card.new-report"),
  name: "New report",
  description: "The comment has been reported. Thank you for your feedback.",
};

/**
 * Comment card component props
 */
interface CommentCardProps extends HTMLAttributes<HTMLIonCardElement> {
  /**
   * Comment
   */
  comment: Comment;

  /**
   * Comment load event handler
   */
  onLoad?: () => void;

  /**
   * Toggle a vote on the comment
   * @param upvote Whether the vote is an upvote or a downvote
   */
  toggleVote: (upvote: boolean) => void;
}

/**
 * Comment card component
 * @param props Props
 * @returns JSX
 */
export const CommentCard: FC<CommentCardProps> = ({
  comment,
  onLoad,
  toggleVote,
  ...props
}) => {
  // Variables
  const AvatarContainer = comment.commenter_id === null ? "div" : IonRouterLink;

  // Hooks
  const id = useId();
  const [time, setTime] = useState<string | undefined>();

  const setMessage = useEphemeralUIStore(state => state.setMessage);

  // Effects
  useEffect(() => {
    // Recompute ago every five seconds
    updateAgo();
    setInterval(updateAgo, 5000);

    // Emit the load event
    onLoad?.();
  }, []);

  // Methods
  /**
   * Update the ago time
   */
  const updateAgo = () => {
    const duration = Date.now() - new Date(comment.created_at).getTime();

    setTime(
      Duration.fromMillis(duration).as("days") < 1
        ? `${formatDuration(duration)} ago`
        : new Date(comment.created_at).toLocaleDateString(),
    );
  };

  /**
   * Share the comment
   */
  const share = async () => {
    // Generate the URL
    const url = new URL(`/posts/${comment.post_id}`, window.location.origin);

    url.search = new URLSearchParams({
      comment: comment.id.toString(),
    }).toString();

    const strUrl = url.toString();

    // Share
    await (navigator.share === undefined
      ? navigator.clipboard.writeText(strUrl)
      : navigator.share({
          url: strUrl,
        }));

    // Display the message
    setMessage(COPIED_LINK_MESSAGE_METADATA);
  };

  /**
   * Report the comment
   */
  const report = async () => {
    // Insert the report
    const {error} = await client.from("comment_reports").insert({
      // eslint-disable-next-line camelcase
      comment_id: comment.id,
    });

    // Handle error
    if (error !== null) {
      if (error.code === "23505") {
        // Display the message
        setMessage(ALREADY_REPORTED_MESSAGE_METADATA);
      }

      return;
    }

    // Display the message
    setMessage(NEW_REPORT_MESSAGE_METADATA);
  };

  return (
    <IonCard
      {...props}
      className={`cursor-pointer dark:text-neutral-300 overflow-hidden rounded-xl text-neutral-700 ${
        props.className ?? ""
      }`}
    >
      <IonCardContent className="p-4">
        <div className="flex flex-row items-center justify-between w-full">
          <AvatarContainer
            className="h-10 w-10"
            {...(comment.commenter_id === null
              ? {}
              : {
                  routerLink: `/users/${comment.commenter_id}`,
                })}
          >
            <Avatar
              profile={{
                emoji: comment.commenter_emoji ?? undefined,
                color: comment.commenter_color ?? undefined,
              }}
            />
          </AvatarContainer>

          <div className="flex flex-row items-center justify-center h-full">
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

        <Markdown className="mt-4 mb-1" raw={comment.content} />

        <div className="flex flex-row items-center justify-between">
          <div />

          <div className="flex flex-row items-center">
            <IonButton
              className={`m-0 ${styles.iconButton}`}
              color={comment.upvote === true ? "success" : "medium"}
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
              {formatScalar(comment.upvotes - comment.downvotes)}
            </p>

            <IonButton
              className={`m-0 ${styles.iconButton}`}
              color={comment.upvote === false ? "danger" : "medium"}
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