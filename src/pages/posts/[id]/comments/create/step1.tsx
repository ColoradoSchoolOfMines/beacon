/* eslint-disable camelcase */
/**
 * @file Create comment step 1 page
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonToggle,
} from "@ionic/react";
import {
  codeSlashOutline,
  codeSlashSharp,
  createOutline,
  createSharp,
  eyeOutline,
  eyeSharp,
} from "ionicons/icons";
import {FC, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory, useParams} from "react-router-dom";
import {z} from "zod";

import {CreateCommentContainer} from "~/components/create-comment-container";
import {Markdown} from "~/components/markdown";
import {SupplementalError} from "~/components/supplemental-error";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {client} from "~/lib/supabase";
import {Post} from "~/lib/types";
import styles from "~/pages/posts/[id]/comments/create/step1.module.css";

/**
 * Comment created message metadata
 */
const COMMENT_CREATED_MESSAGE_METADATA = {
  symbol: Symbol("comment.created"),
  name: "Success",
  description: "Your comment has been created.",
};

/**
 * Content mode
 */
enum ContentMode {
  /**
   * View the raw content
   */
  RAW = "raw",

  /**
   * Preview the rendered content
   */
  PREVIEW = "preview",
}

/**
 * Minimum content length
 */
const MIN_CONTENT_LENGTH = 1;

/**
 * Maximum content length
 */
const MAX_CONTENT_LENGTH = 300;

/**
 * Form schema
 */
const formSchema = z.object({
  anonymous: z.boolean(),
  content: z.string().min(MIN_CONTENT_LENGTH).max(MAX_CONTENT_LENGTH),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create comment step 1 page
 * @returns JSX
 */
export const Step1: FC = () => {
  // Hooks
  const [post, setPost] = useState<Post | undefined>();

  const [contentTextarea, setContentTextarea] =
    // eslint-disable-next-line unicorn/no-null
    useState<HTMLIonTextareaElement | null>(null);

  const setMessage = useEphemeralUIStore(state => state.setMessage);
  const refreshContent = useEphemeralUIStore(state => state.refreshContent);

  const [contentMode, setContentMode] = useState<ContentMode>(ContentMode.RAW);

  const params = useParams<{id: string}>();
  const history = useHistory();

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    defaultValues: {
      anonymous: false,
    },
    resolver: zodResolver(formSchema),
  });

  // Effects
  useEffect(() => {
    // Fetch the post
    fetchPost();
  }, []);

  useEffect(() => {
    if (contentTextarea === null) {
      return;
    }

    // Focus the content textarea
    if (contentMode === ContentMode.RAW) {
      // setFocus has a race condition
      setTimeout(() => contentTextarea.setFocus(), 50);
    }
  }, [contentMode, contentTextarea]);

  // Methods
  /**
   * Fetch the post
   */
  const fetchPost = async () => {
    // Get the post
    const {data, error} = await client
      .from("personalized_posts")
      .select(
        "id, poster_id, created_at, content, has_media, blur_hash, aspect_ratio, views, distance, upvotes, downvotes, comments, poster_color, poster_emoji, upvote",
      )
      .eq("id", params.id)
      .single();

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Update the state
    setPost(data as any);
  };

  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    if (post === undefined) {
      throw new TypeError("Post is undefined");
    }

    // Insert the post
    const {error} = await client.from("comments").insert({
      post_id: post.id!,
      private_anonymous: form.anonymous,
      content: form.content,
    });

    // Handle error
    if (error !== null) {
      return;
    }

    // Reset the post forms
    reset();

    // Display the message
    setMessage(COMMENT_CREATED_MESSAGE_METADATA);

    // Refetch the content
    await refreshContent?.();

    // Go back
    history.goBack();
  };

  return (
    <CreateCommentContainer back={false} post={post}>
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <IonList className="flex flex-col h-full py-0">
          <Controller
            control={control}
            name="content"
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <div className="flex flex-col flex-1 px-4 pt-4">
                <IonLabel className="pb-2">Content</IonLabel>

                <div className="flex-1 relative">
                  <div className="absolute flex flex-col left-0 right-0 bottom-0 top-0">
                    {contentMode === ContentMode.RAW ? (
                      <IonTextarea
                        className={`h-full w-full ${styles.textarea}`}
                        autocapitalize="on"
                        counter={true}
                        fill="outline"
                        maxlength={MAX_CONTENT_LENGTH}
                        minlength={MIN_CONTENT_LENGTH}
                        onIonBlur={onBlur}
                        onIonInput={onChange}
                        ref={setContentTextarea}
                        spellcheck={true}
                        value={value}
                      />
                    ) : (
                      <>
                        <Markdown
                          className="break-anywhere h-full overflow-auto py-2 text-wrap w-full whitespace-pre"
                          raw={value}
                        />
                      </>
                    )}
                  </div>
                </div>

                <SupplementalError error={error?.message} />

                <IonSegment
                  className="mt-7"
                  value={contentMode}
                  onIonChange={event =>
                    setContentMode(event.detail.value as ContentMode)
                  }
                >
                  <IonSegmentButton layout="icon-start" value={ContentMode.RAW}>
                    <IonLabel>Raw</IonLabel>
                    <IonIcon ios={codeSlashOutline} md={codeSlashSharp} />
                  </IonSegmentButton>
                  <IonSegmentButton
                    layout="icon-start"
                    value={ContentMode.PREVIEW}
                  >
                    <IonLabel>Preview</IonLabel>
                    <IonIcon ios={eyeOutline} md={eyeSharp} />
                  </IonSegmentButton>
                </IonSegment>
              </div>
            )}
          />

          <IonItem>
            <Controller
              control={control}
              name="anonymous"
              render={({field: {onChange, onBlur, value}}) => (
                <IonToggle
                  checked={value}
                  onIonBlur={onBlur}
                  onIonChange={event => onChange(event.detail.checked)}
                >
                  <IonLabel>Make this post anonymous</IonLabel>
                  <IonNote>
                    Your username will be hidden from other users.
                  </IonNote>
                </IonToggle>
              )}
            />
          </IonItem>

          <div className="m-4">
            <IonButton
              className="m-0 overflow-hidden rounded-lg w-full"
              expand="full"
              type="submit"
            >
              Post
              <IonIcon slot="end" ios={createOutline} md={createSharp} />
            </IonButton>
          </div>
        </IonList>
      </form>
    </CreateCommentContainer>
  );
};
