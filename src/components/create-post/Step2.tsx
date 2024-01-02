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
import {createOutline, createSharp} from "ionicons/icons";
import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {CreatePostContainer} from "~/components/create-post/Container";
import {Map} from "~/components/Map";
import {SupplementalError} from "~/components/SupplementalError";
import {useStore} from "~/lib/state";

/**
 * Minimum radius (In meters)
 */
const MIN_RADIUS = 500;

/**
 * Maximum radius (In meters)
 */
const MAX_RADIUS = 50000;

/**
 * Default radius (In meters)
 */
const DEFAULT_RADIUS = 5000;

/**
 * Radius step (In meters)
 */
const RADIUS_STEP = 100;

/**
 * Form schema
 */
const formSchema = z.object({
  anonymous: z.boolean(),
  radius: z.number().min(MIN_RADIUS).max(MAX_RADIUS),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Create post step 2 component
 * @returns JSX
 */
export const Step2: React.FC = () => {
  const post = useStore(state => state.post);

  const {control, handleSubmit, setValue} = useForm<FormSchema>({
    defaultValues: {
      anonymous: false,
      radius: DEFAULT_RADIUS,
    },
    resolver: zodResolver(formSchema),
  });

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

  return (
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
                  Make this post anonymous
                </IonToggle>
              )}
            />
          </IonItem>

          <div className="flex flex-1 flex-col mt-4 mx-4">
            <IonLabel>Radius</IonLabel>
            <IonNote className="ml-0 my-4 p-0 text-[1rem]">
              Only people within the below radius of your current location will
              be able to see this post.
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
                      min={MIN_RADIUS}
                      max={MAX_RADIUS}
                      step={RADIUS_STEP}
                      onIonBlur={onBlur}
                      onIonInput={onChange}
                      value={value}
                    />
                    <IonInput
                      aria-label="Radius"
                      className="ml-2 w-unset"
                      fill="outline"
                      onIonBlur={onBlur}
                      onIonChange={event =>
                        onChange(Number.parseInt(event.detail.value ?? ""))
                      }
                      type="number"
                      min={MIN_RADIUS}
                      max={MAX_RADIUS}
                      step={RADIUS_STEP.toString()}
                      value={value}
                    />
                  </div>

                  <SupplementalError error={error?.message} />
                </>
              )}
            />

            <Map
              className="flex-1 mt-4 overflow-hidden rounded-lg w-full"
              position={[51.505, -0.09]}
              lockPosition={true}
              zoom={14}
              minZoom={8}
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
