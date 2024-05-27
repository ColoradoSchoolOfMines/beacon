/**
 * @file Create post step 1 page
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
  useIonActionSheet,
} from "@ionic/react";
import {
  arrowForwardOutline,
  arrowForwardSharp,
  closeOutline,
  closeSharp,
  codeSlashOutline,
  codeSlashSharp,
  eyeOutline,
  eyeSharp,
  imageOutline,
  imageSharp,
} from "ionicons/icons";
import {FC, useEffect, useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post-container";
import {Markdown} from "~/components/markdown";
import {SupplementalError} from "~/components/supplemental-error";
import {
  captureMedia,
  createMediaElement,
  getCategory,
  getMediaDimensions,
  MAX_MEDIA_DIMENSION,
  MIN_MEDIA_DIMENSION,
} from "~/lib/media";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {MediaCategory} from "~/lib/types";
import styles from "~/pages/posts/create/step1.module.css";

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
  content: z.string().min(MIN_CONTENT_LENGTH).max(MAX_CONTENT_LENGTH),
  media: z
    .instanceof(File)
    .optional()
    .superRefine(async (value, ctx) => {
      if (value !== undefined) {
        // Get the dimensions
        const category = getCategory(value.type);

        if (category === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unsupported media type ${value.type}`,
            fatal: true,
          });

          return;
        }

        const objectURL = URL.createObjectURL(value);
        const element = await createMediaElement(category, objectURL);
        const dimensions = getMediaDimensions(category, element);
        URL.revokeObjectURL(objectURL);

        // Check the media dimensions
        if (
          dimensions.height < MIN_MEDIA_DIMENSION ||
          dimensions.width < MIN_MEDIA_DIMENSION
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Media must be at least ${MIN_MEDIA_DIMENSION} x ${MIN_MEDIA_DIMENSION}`,
          });
        }

        if (
          dimensions.height > MAX_MEDIA_DIMENSION ||
          dimensions.width > MAX_MEDIA_DIMENSION
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Media must be at most ${MAX_MEDIA_DIMENSION} x ${MAX_MEDIA_DIMENSION}`,
          });
        }
      }

      return false;
    }),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create post step 1 page
 * @returns JSX
 */
export const Step1: FC = () => {
  // Hooks
  const [contentTextarea, setContentTextarea] =
    // eslint-disable-next-line unicorn/no-null
    useState<HTMLIonTextareaElement | null>(null);

  const [contentMode, setContentMode] = useState<ContentMode>(ContentMode.RAW);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const mediaInput = useRef<HTMLInputElement | null>(null);

  const post = useEphemeralStore(state => state.postBeingCreated);
  const setPost = useEphemeralStore(state => state.setPostBeingCreated);

  const [present] = useIonActionSheet();

  const history = useHistory();

  const {control, handleSubmit, reset, setValue, watch} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Variables
  const media = watch("media");

  const mediaCategory =
    media?.type === undefined ? undefined : getCategory(media.type);

  // Effects
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

  useEffect(() => {
    // Reset the form
    if (post === undefined) {
      reset();

      if (mediaInput.current !== null) {
        mediaInput.current.value = "";
      }
    }
  }, [post]);

  useEffect(() => {
    // Update the upload value
    if (media === undefined && mediaInput.current !== null) {
      mediaInput.current.value = "";
    }

    // Update the preview URL
    (async () => {
      let url: string | undefined;

      if (media !== undefined) {
        url = URL.createObjectURL(media);
      }

      setPreviewUrl(url);
    })();
  }, [media]);

  // Methods
  /**
   * Capture media and update the form
   * @param category Media category
   * @param newCapture Whether to capture new media
   */
  const captureMediaAndUpdateForm = async <T extends boolean>(
    newCapture: T,
    category: T extends true ? MediaCategory : MediaCategory | undefined,
  ) => {
    // Capture the media
    const media = await captureMedia(newCapture, category);

    // Update the form
    setValue("media", media);
  };

  /**
   * Prompt the user to add media to the post
   * @returns Promise
   */
  const addMedia = () =>
    present({
      header: "Choose Photo/Video",
      subHeader: "Note: you can only add one photo or video per post.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "New photo",
          role: "selected",
          /**
           * Capture a new photo
           * @returns Promise
           */
          handler: () => captureMediaAndUpdateForm(true, MediaCategory.IMAGE),
        },
        {
          text: "New video",
          role: "selected",
          /**
           * Capture a new video
           * @returns Promise
           */
          handler: () => captureMediaAndUpdateForm(true, MediaCategory.VIDEO),
        },
        {
          text: "Existing photo/video",
          role: "selected",
          /**
           * Capture an existing photo or video
           * @returns Promise
           */
          handler: () => captureMediaAndUpdateForm(false, undefined),
        },
      ],
    });

  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    // Update the post
    setPost({
      content: form.content,
      media: form.media,
    });

    // Go to the next step
    history.push("/posts/create/2");
  };

  return (
    <CreatePostContainer>
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

          <IonItem className={`mt-4 ${styles.collapsedItem}`} />

          <IonItem>
            <Controller
              control={control}
              name="media"
              render={({fieldState: {error}}) => (
                <div className="flex flex-col w-full">
                  <IonButton className="w-full" fill="clear" onClick={addMedia}>
                    <div className="flex flex-col">
                      <div className="flex flex-row items-center justify-center relative w-full my-2">
                        <IonIcon
                          className="text-2xl"
                          ios={imageOutline}
                          md={imageSharp}
                        />

                        <p className="ml-2 text-3.5 text-center">
                          Add a photo or video
                        </p>

                        {media !== undefined && (
                          <IonButton
                            fill="clear"
                            onClick={event => {
                              event.stopPropagation();
                              setValue("media", undefined);
                            }}
                          >
                            <IonIcon
                              slot="icon-only"
                              ios={closeOutline}
                              md={closeSharp}
                            />
                          </IonButton>
                        )}
                      </div>

                      {previewUrl !== undefined &&
                        mediaCategory !== undefined && (
                          <div className="max-h-[50vh] mb-4 overflow-hidden pointer-events-none rounded-lg w-full">
                            {(() => {
                              switch (mediaCategory) {
                                case MediaCategory.IMAGE:
                                  return (
                                    <img
                                      alt="Media preview"
                                      className="object-cover mx-auto"
                                      src={previewUrl}
                                    />
                                  );

                                case MediaCategory.VIDEO:
                                  return (
                                    <video
                                      autoPlay
                                      className="object-cover mx-auto"
                                      loop
                                      muted
                                      src={previewUrl}
                                    />
                                  );
                              }
                            })()}
                          </div>
                        )}
                    </div>
                  </IonButton>

                  <SupplementalError error={error?.message} />
                </div>
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
