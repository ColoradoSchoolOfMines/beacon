/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */
/**
 * @file Create post step 2 page
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRange,
  IonToggle,
} from "@ionic/react";
import {
  createOutline,
  createSharp,
  globeOutline,
  globeSharp,
  locationOutline,
  locationSharp,
} from "ionicons/icons";
import {round} from "lodash-es";
import {FC, useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post-container";
import {Map} from "~/components/map";
import {SupplementalError} from "~/components/supplemental-error";
import {
  BLURHASH_COMPONENT_X,
  BLURHASH_COMPONENT_Y,
  createBlurhash,
  createMediaCanvas,
  createMediaElement,
  exportMedia,
  getCategory,
  getMediaDimensions,
} from "~/lib/media";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {
  GlobalMessageMetadata,
  MeasurementSystem,
  MediaCategory,
} from "~/lib/types";
import {METERS_TO_KILOMETERS, METERS_TO_MILES} from "~/lib/utils";
import styles from "~/pages/posts/create/step2.module.css";

/**
 * Geolocation not supported message metadata
 */
const GEOLOCATION_NOT_SUPPORTED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("geolocation.not-supported"),
  name: "Geolocation not supported",
  description: "Geolocation is not supported on this device.",
};

/**
 * Post created message metadata
 */
const POST_CREATED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("post.created"),
  name: "Success",
  description: "Your post has been created.",
};

/**
 * Minimum radius (In meters)
 */
const MIN_RADIUS = 500;

/**
 * Maximum radius (In meters)
 */
const MAX_RADIUS = 50000;

/**
 * Form schema
 */
const formSchema = z.object({
  anonymous: z.boolean(),
  radius: z
    .number()
    .min(MIN_RADIUS - 1e-4)
    .max(MAX_RADIUS + 1e-4),
});

// Types
/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create post step 2 page
 * @returns JSX
 */
export const Step2: FC = () => {
  // Hooks
  const location = useEphemeralStore(state => state.location);
  const setMessage = useEphemeralStore(state => state.setMessage);
  const refreshContent = useEphemeralStore(state => state.refreshContent);

  const measurementSystem = usePersistentStore(
    state => state.measurementSystem,
  );

  const post = useEphemeralStore(state => state.postBeingCreated);
  const setPost = useEphemeralStore(state => state.setPostBeingCreated);

  const history = useHistory();

  // Variables
  /**
   * Conversion factor
   */
  const conversionFactor =
    measurementSystem === MeasurementSystem.METRIC
      ? METERS_TO_KILOMETERS
      : METERS_TO_MILES;

  let minRadius: number;
  let maxRadius: number;
  let defaultRadius: number;
  let radiusStep: number;

  switch (measurementSystem) {
    case MeasurementSystem.METRIC:
      minRadius = 1;
      maxRadius = 50;
      defaultRadius = 5 / conversionFactor;
      radiusStep = 1;
      break;

    case MeasurementSystem.IMPERIAL:
      minRadius = 0.5;
      maxRadius = 30;
      defaultRadius = 3 / conversionFactor;
      radiusStep = 0.5;
      break;
  }

  // More hooks
  const {control, handleSubmit, watch, reset} = useForm<FormSchema>({
    defaultValues: {
      anonymous: false,
      radius: defaultRadius,
    },
    resolver: zodResolver(formSchema),
  });

  const radius = watch("radius");

  // Effects
  useEffect(() => {
    // Reset the form
    if (post === undefined) {
      reset();
    }
  }, [post]);

  // Methods
  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    if (post === undefined) {
      throw new TypeError("Post is undefined");
    }

    if (location === undefined) {
      setMessage(GEOLOCATION_NOT_SUPPORTED_MESSAGE_METADATA);
    }

    let aspectRatio: number | null = null;
    let blurHash: string | null = null;
    let blob: Blob | undefined = undefined;

    // Process the media
    if (post.media !== undefined) {
      // Get the media category
      const category = getCategory(post.media.type)!;

      // Generate an object URL for the media
      const objectURL = URL.createObjectURL(post.media!);

      // Create the media element and canvas
      const element = await createMediaElement(category, objectURL);
      const dimensions = getMediaDimensions(category, element);
      aspectRatio = dimensions.width / dimensions.height;
      const canvas = createMediaCanvas(element, dimensions);

      // Revoke the object URL (The media has already been drawn to the canvas)
      URL.revokeObjectURL(objectURL);

      // Generate the blurhash
      blurHash = await createBlurhash(
        canvas,
        dimensions,
        BLURHASH_COMPONENT_X,
        BLURHASH_COMPONENT_Y,
      );

      // Export the media if it is an image (to strip metadata)
      blob =
        category === MediaCategory.IMAGE
          ? await exportMedia(canvas, post.media.type, 1)
          : post.media;
    }

    // Insert the post
    const {data, error} = await client
      .from("posts")
      .insert({
        private_anonymous: form.anonymous,
        radius: form.radius,
        content: post.content!,
        has_media: post.media !== undefined,
        blur_hash: blurHash,
        aspect_ratio: aspectRatio,
      })
      .select("id")
      .single<{
        id: string;
      }>();

    // Handle error
    if (data === null || error !== null) {
      return;
    }

    // Upload the media
    if (blob !== undefined) {
      const {error} = await client.storage
        .from("media")
        .upload(`posts/${data.id}`, blob);

      // Handle error
      if (error !== null) {
        return;
      }
    }

    // Reset the post forms
    setPost(undefined);

    // Display the message
    setMessage(POST_CREATED_MESSAGE_METADATA);

    // Refetch the content
    await refreshContent?.();

    // Go back twice
    history.goBack();
    history.goBack();
  };

  return (
    <CreatePostContainer>
      <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
        <IonList className="flex flex-col h-full py-0">
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
                  <IonNote className="whitespace-break-spaces">
                    Your username will be hidden from other users.
                  </IonNote>
                </IonToggle>
              )}
            />
          </IonItem>

          <div className="flex flex-1 flex-col mt-4 mx-4">
            <IonLabel>Radius</IonLabel>
            <IonNote className="whitespace-break-spaces">
              Only people in the blue region will be able to see and comment on
              this post.
            </IonNote>

            <Controller
              control={control}
              name="radius"
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => (
                <>
                  <div className="flex flex-row items-center justify-center">
                    <IonRange
                      aria-label="Radius"
                      className={`flex-1 ml-2 mr-2 ${styles.range}`}
                      min={minRadius}
                      max={maxRadius}
                      step={radiusStep}
                      onIonBlur={onBlur}
                      onIonInput={event =>
                        onChange(
                          (event.detail.value as number) / conversionFactor,
                        )
                      }
                      value={value * conversionFactor}
                    >
                      <IonIcon
                        slot="start"
                        ios={locationOutline}
                        md={locationSharp}
                      />
                      <IonIcon slot="end" ios={globeOutline} md={globeSharp} />
                    </IonRange>
                    <IonInput
                      aria-label="Radius"
                      className="ml-2 w-28"
                      fill="outline"
                      onIonBlur={onBlur}
                      onIonChange={event =>
                        onChange(
                          Number.parseInt(event.detail.value ?? "0") /
                            conversionFactor,
                        )
                      }
                      type="number"
                      min={minRadius}
                      max={maxRadius}
                      step={radiusStep.toString()}
                      value={round(value * conversionFactor, 1)}
                    >
                      <IonLabel class="!ml-2" slot="end">
                        {measurementSystem === MeasurementSystem.METRIC
                          ? "km"
                          : "mi"}
                      </IonLabel>
                    </IonInput>
                  </div>

                  <SupplementalError error={error?.message} />
                </>
              )}
            />

            {location !== undefined && (
              <Map
                className="flex-1 mt-4 overflow-hidden rounded-lg w-full"
                position={[location.coords.latitude, location.coords.longitude]}
                bounds={[
                  [
                    location.coords.latitude + 0.75,
                    location.coords.longitude + 0.75,
                  ],
                  [
                    location.coords.latitude - 0.75,
                    location.coords.longitude - 0.75,
                  ],
                ]}
                zoom={11}
                minZoom={6}
                circle={{
                  center: [location.coords.latitude, location.coords.longitude],
                  radius: radius,
                }}
              />
            )}
          </div>

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
    </CreatePostContainer>
  );
};
