/**
 * @file Create post step 2 component
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
import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post/Container";
import {Map} from "~/components/Map";
import {SupplementalError} from "~/components/SupplementalError";
import {useStore} from "~/lib/state";
import {MeasurementSystem} from "~/lib/types";
import {Error} from "~/pages/Error";

/**
 * Kilometers to meters conversion factor
 */
const KILOMETERS_TO_METERS = 1000;

/**
 * Miles to meters conversion factor
 */
const MILES_TO_METERS = 1609.344;

/**
 * Create post step 2 component
 * @returns JSX
 */
export const Step2: React.FC = () => {
  // Hooks
  const post = useStore(state => state.post);
  const location = useStore(state => state.location);
  const measurementSystem = useStore(state => state.measurementSystem);

  // Constants
  /**
   * Minimum radius (In kilometers or miles, depending on the current measurement system)
   */
  const minRadius = measurementSystem === MeasurementSystem.METRIC ? 1 : 0.5;

  /**
   * Maximum radius (In kilometers or miles, depending on the current measurement system)
   */
  const maxRadius = measurementSystem === MeasurementSystem.METRIC ? 50 : 30;

  /**
   * Default radius (In kilometers or miles, depending on the current measurement system)
   */
  const defaultRadius = measurementSystem === MeasurementSystem.METRIC ? 5 : 3;

  /**
   * Radius step (In kilometers or miles, depending on the current measurement system)
   */
  const radiusStep = measurementSystem === MeasurementSystem.METRIC ? 1 : 0.5;

  /**
   * Form schema
   */
  const formSchema = z.object({
    anonymous: z.boolean(),
    radius: z.number().min(minRadius).max(maxRadius),
  });

  // Types
  /**
   * Form schema type
   */
  type FormSchema = z.infer<typeof formSchema>;

  // More hooks
  const {control, handleSubmit, setValue, watch} = useForm<FormSchema>({
    defaultValues: {
      anonymous: false,
      radius: defaultRadius,
    },
    resolver: zodResolver(formSchema),
  });

  const radius = watch("radius");

  // Effects
  useEffect(() => {
    // Update the form
    if (post?.anonymous !== undefined) {
      setValue("anonymous", post.anonymous);
    }

    if (post?.radius !== undefined) {
      setValue("radius", post.radius);
    }
  }, [post]);

  // Methods
  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    console.log(post, form);
  };

  return location === undefined ? (
    <Error
      name="Geolocation error"
      description="Geolocation not supported or permission denied."
      homeButton={true}
    />
  ) : (
    <CreatePostContainer back={true}>
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
                  <IonNote>
                    Your username will be hidden from other users.
                  </IonNote>
                </IonToggle>
              )}
            />
          </IonItem>

          <div className="flex flex-1 flex-col mt-4 mx-4">
            <IonLabel>Radius</IonLabel>
            <IonNote>
              Only people within this radius of your location at the time of
              posting will be able to see this post. (If your location is not
              accurate, make sure you&apos;ve granted the <b>high accuracy</b>{" "}
              geolocation permissions to Beacon and reload the page.)
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
                      className="flex-1 ml-2 mr-2"
                      min={minRadius}
                      max={maxRadius}
                      step={radiusStep}
                      onIonBlur={onBlur}
                      onIonInput={onChange}
                      value={value}
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
                      className="ml-2 w-24"
                      fill="outline"
                      onIonBlur={onBlur}
                      onIonChange={event =>
                        onChange(Number.parseInt(event.detail.value ?? ""))
                      }
                      type="number"
                      min={minRadius}
                      max={maxRadius}
                      step={radiusStep.toString()}
                      value={value}
                    >
                      <IonLabel slot="end">
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
                radius:
                  radius *
                  (measurementSystem === MeasurementSystem.METRIC
                    ? KILOMETERS_TO_METERS
                    : MILES_TO_METERS),
              }}
            />
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
