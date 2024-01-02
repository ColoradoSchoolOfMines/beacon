/**
 * @file Create post step 1 component
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
} from "@ionic/react";
import {
  arrowForwardOutline,
  arrowForwardSharp,
  codeSlashOutline,
  codeSlashSharp,
  eyeOutline,
  eyeSharp,
  imageOutline,
  imageSharp,
} from "ionicons/icons";
import {useContext, useEffect, useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post/Container";
import styles from "~/components/create-post/Step1.module.css";
import {Step2} from "~/components/create-post/Step2";
import {Markdown} from "~/components/Markdown";
import {SupplementalError} from "~/components/SupplementalError";
import {useStore} from "~/lib/state";
import {CreatePostNavContext} from "~/pages/CreatePost";

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
 * Media mime types
 */
const MEDIA_MIME_TYPES = [
  // Images
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",

  // Videos
  "video/mp4",
  "video/mpeg",
  "video/webm",
];

/**
 * Form schema
 */
const formSchema = z.object({
  content: z.string().min(MIN_CONTENT_LENGTH).max(MAX_CONTENT_LENGTH),
  media: z
    .array(z.instanceof(File))
    .min(0)
    .max(1)
    .optional()
    .refine(
      value =>
        value === undefined ||
        value.length === 0 ||
        MEDIA_MIME_TYPES.includes(value[0]!.type),
      {
        message: "Unsupported media type",
      },
    ),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create post step 1 component
 * @returns JSX
 */
export const Step1: React.FC = () => {
  // Hooks
  const contentTextarea = useRef<HTMLIonTextareaElement | null>(null);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [contentMode, setContentMode] = useState<ContentMode>(ContentMode.RAW);

  const post = useStore(state => state.post);
  const setPost = useStore(state => state.setPost);

  const nav = useContext(CreatePostNavContext);

  const {control, handleSubmit, setValue, watch} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const media = watch("media");

  // Effects
  useEffect(() => {
    // Focus the content textarea
    setTimeout(() => contentTextarea.current?.setFocus(), 10);
  }, []);

  useEffect(() => {
    // Update the form
    if (post?.content !== undefined) {
      setValue("content", post.content);
    }

    if (post?.media !== undefined) {
      setValue("media", [post.media]);
    }
  }, [post]);

  useEffect(
    () => setFilenames(media === undefined ? [] : media.map(file => file.name)),
    [media],
  );

  // Methods
  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    // Update the post
    setPost({
      content: form.content,
      media: form.media?.[0],
    });

    // Go to the next step
    nav?.push(() => <Step2 />);
  };

  return (
    <CreatePostContainer back={false}>
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <IonList className="flex flex-col h-full py-0">
          <Controller
            control={control}
            name="content"
            render={({
              field: {onChange, onBlur, value},
              fieldState: {error},
            }) => (
              <div className="flex flex-col flex-1 px-4">
                <div className="flex-1 relative">
                  <div className="absolute flex flex-col left-0 right-0 bottom-0 top-0">
                    {contentMode === ContentMode.RAW ? (
                      <IonTextarea
                        className={`h-full w-full ${styles.textarea}`}
                        autocapitalize="on"
                        counter={true}
                        maxlength={MAX_CONTENT_LENGTH}
                        minlength={MIN_CONTENT_LENGTH}
                        onIonBlur={onBlur}
                        onIonInput={onChange}
                        ref={contentTextarea}
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

          <IonItem className={`mt-4 ${styles.collapsedItem}`} />

          <IonItem>
            <Controller
              control={control}
              name="media"
              render={({field: {onChange, onBlur}, fieldState: {error}}) => (
                <>
                  <label className="flex flex-row items-center justify-center w-full">
                    <p className="mr-4 text-center">
                      Add a photo or video (
                      {filenames.length > 0
                        ? `Selected: ${filenames.join(", ")}`
                        : "No files selected"}
                      )
                    </p>

                    <IonIcon
                      className="text-2xl"
                      color="primary"
                      ios={imageOutline}
                      md={imageSharp}
                    />

                    <input
                      accept={MEDIA_MIME_TYPES.join(",")}
                      onChange={event =>
                        onChange(
                          event.target.files === null
                            ? []
                            : Array.from(event.target.files),
                        )
                      }
                      onBlur={onBlur}
                      className="h-0 w-0"
                      type="file"
                    />
                  </label>

                  <SupplementalError error={error?.message} />
                </>
              )}
            />
          </IonItem>

          <div className="m-4">
            <IonButton
              className="m-0 overflow-hidden rounded-lg w-full"
              expand="full"
              type="submit"
            >
              Next
              <IonIcon
                slot="end"
                ios={arrowForwardOutline}
                md={arrowForwardSharp}
              />
            </IonButton>
          </div>
        </IonList>
      </form>
    </CreatePostContainer>
  );
};
