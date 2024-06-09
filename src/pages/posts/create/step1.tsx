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
  useIonLoading,
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
  BLURHASH_COMPONENT_X,
  BLURHASH_COMPONENT_Y,
  captureMedia,
  createBlurhash,
  createMediaCanvas,
  createMediaElement,
  exportMedia,
  getCategory,
  getMediaDimensions,
  MAX_MEDIA_DIMENSION,
  MAX_MEDIA_SIZE,
  MIN_MEDIA_DIMENSION,
  PREFERRED_IMAGE_MIME_TYPE,
  PREFERRED_IMAGE_QUALITY,
  scaleCanvas,
} from "~/lib/media";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {MediaCategory, MediaDimensions} from "~/lib/types";
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
    .object({
      aspectRatio: z.number(),
      blurHash: z.string(),
      blob: z.instanceof(Blob),
      category: z.nativeEnum(MediaCategory),
      objectURL: z.string(),
    })
    .optional(),
});

/**
 * Form schema input type
 */
type FormSchemaInput = z.input<typeof formSchema>;

/**
 * Form schema output type
 */
type FormSchemaOutput = z.output<typeof formSchema>;

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
  const mediaInput = useRef<HTMLInputElement | null>(null);

  const post = useEphemeralStore(state => state.postBeingCreated);
  const setPost = useEphemeralStore(state => state.setPostBeingCreated);

  const [presentActionSheet] = useIonActionSheet();
  const [presentLoading, dismissLoading] = useIonLoading();

  const history = useHistory();

  const {control, handleSubmit, reset, setError, setValue, watch} = useForm<
    FormSchemaInput,
    z.ZodTypeDef,
    FormSchemaOutput
  >({
    resolver: zodResolver(formSchema),
  });

  // Variables
  const media = watch("media");

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
  }, [media]);

  // Methods
  /**
   * Capture media and update the form
   * @param newCapture Whether to capture new media
   * @param rawCategory Media category
   */
  const captureMediaAndUpdateForm = async <T extends boolean>(
    newCapture: T,
    rawCategory: T extends true ? MediaCategory : MediaCategory | undefined,
  ) => {
    // Capture the media
    const media = await captureMedia(newCapture, rawCategory);

    // Start the loading indicator
    await presentLoading({
      message: "Processing media...",
    });

    // Get the media category
    const category = rawCategory ?? getCategory(media.type);

    if (category === undefined) {
      setError("media", {message: `Unsupported media type ${media.type}`});
      await dismissLoading();

      return;
    }

    // Generate an object URL for the media
    const originalObjectURL = URL.createObjectURL(media);

    // Create the media element and canvas
    const element = await createMediaElement(category, originalObjectURL);
    const dimensions = getMediaDimensions(category, element);

    const aspectRatio = dimensions.width / dimensions.height;
    let canvas = createMediaCanvas(element, dimensions);

    // Check the media dimensions
    if (
      dimensions.height > MAX_MEDIA_DIMENSION ||
      dimensions.width > MAX_MEDIA_DIMENSION
    ) {
      switch (category) {
        case MediaCategory.IMAGE: {
          // Calculate scaled dimensions (while preserving aspect ratio)
          const scaledDimensions: MediaDimensions =
            aspectRatio > 1
              ? {
                  height: Math.floor(MAX_MEDIA_DIMENSION / aspectRatio),
                  width: MAX_MEDIA_DIMENSION,
                }
              : {
                  height: MAX_MEDIA_DIMENSION,
                  width: Math.floor(MAX_MEDIA_DIMENSION * aspectRatio),
                };

          // Scale the media
          canvas = scaleCanvas(canvas, scaledDimensions);

          break;
        }

        default:
          setError("media", {
            message: `Media must be at most ${MAX_MEDIA_DIMENSION} x ${MAX_MEDIA_DIMENSION}`,
          });

          await dismissLoading();

          return;
      }
    }

    if (
      dimensions.height < MIN_MEDIA_DIMENSION ||
      dimensions.width < MIN_MEDIA_DIMENSION
    ) {
      setError("media", {
        message: `Media must be at least ${MIN_MEDIA_DIMENSION} x ${MIN_MEDIA_DIMENSION}`,
      });

      await dismissLoading();

      return;
    }

    // Generate the blurhash
    const blurHash = await createBlurhash(
      canvas,
      BLURHASH_COMPONENT_X,
      BLURHASH_COMPONENT_Y,
    );

    // Export the media if it is an image (to strip metadata)
    let blob: Blob;
    let objectURL: string;

    switch (category) {
      case MediaCategory.IMAGE:
        blob = await exportMedia(
          canvas,
          PREFERRED_IMAGE_MIME_TYPE,
          PREFERRED_IMAGE_QUALITY,
        );

        objectURL = URL.createObjectURL(blob);
        break;

      default:
        blob = media;
        objectURL = originalObjectURL;
        break;
    }

    // Check the media size
    if (blob.size > MAX_MEDIA_SIZE) {
      setError("media", {
        message: `Media must be at most ${MAX_MEDIA_SIZE / (1024 * 1024)} MiB`,
      });

      await dismissLoading();

      return;
    }

    setValue("media", {
      aspectRatio,
      blurHash,
      blob,
      category,
      objectURL,
    });

    await dismissLoading();
  };

  /**
   * Prompt the user to add media to the post
   * @returns Promise
   */
  const addMedia = () =>
    presentActionSheet({
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
           */
          handler: () => {
            captureMediaAndUpdateForm(true, MediaCategory.IMAGE);
          },
        },
        {
          text: "New video",
          role: "selected",
          /**
           * Capture a new video
           */
          handler: () => {
            captureMediaAndUpdateForm(true, MediaCategory.VIDEO);
          },
        },
        {
          text: "Existing photo/video",
          role: "selected",
          /**
           * Capture an existing photo or video
           */
          handler: () => {
            captureMediaAndUpdateForm(false, undefined);
          },
        },
      ],
    });

  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchemaOutput) => {
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
                          className="break-anywhere h-full overflow-auto py-2 text-wrap w-full"
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

                      {media !== undefined && (
                        <div className="h-[50vh] mb-4 overflow-hidden pointer-events-none rounded-lg w-full">
                          {(() => {
                            switch (media?.category) {
                              case MediaCategory.IMAGE:
                                return (
                                  <img
                                    alt="Media preview"
                                    className="h-full w-full"
                                    src={media.objectURL}
                                  />
                                );

                              case MediaCategory.VIDEO:
                                return (
                                  <video
                                    autoPlay
                                    className="h-full w-full"
                                    loop
                                    muted
                                    src={media.objectURL}
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
