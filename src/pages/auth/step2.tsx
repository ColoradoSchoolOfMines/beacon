/**
 * @file Auth step 2 page
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {checkmarkOutline, checkmarkSharp} from "ionicons/icons";
import {FC} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {AuthContainer} from "~/components/auth-container";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {client} from "~/lib/supabase";
import {UserMetadata} from "~/lib/types";

/**
 * Failed to login message metadata symbol
 */
const FAILED_TO_LOGIN_MESSAGE_METADATA_SYMBOL = Symbol("auth.failed-to-login");

/**
 * Form schema
 */
const formSchema = z.object({
  code: z
    .string()
    .min(1)
    .refine(value => /^\d+$/.test(value), {
      message: "Invalid code",
    }),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

/**
 * Auth step 2 component
 * @returns JSX
 */
export const Step2: FC = () => {
  // Hooks
  const email = useEphemeralStore(state => state.email);
  const setMessage = useEphemeralStore(state => state.setMessage);
  const history = useHistory();

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Methods
  /**
   * Verify the code
   * @param code Code
   */
  const verify = async (code: string) => {
    // Log in
    const {data, error} = await client.auth.verifyOtp({
      email: email!,
      token: code,
      type: "email",
    });

    // Handle the error
    if (error !== null) {
      // Reset the form
      reset();

      // Display the message
      setMessage({
        symbol: FAILED_TO_LOGIN_MESSAGE_METADATA_SYMBOL,
        name: "Failed to log in",
        description: error.message,
      });

      // Go back to the previous step
      history.goBack();

      return;
    }

    // Get the user metadata
    const userMetadata = data!.user!.user_metadata as UserMetadata;

    // Go to the terms and conditions if the user hasn't accepted them
    history.push(userMetadata.acceptedTerms ? "/nearby" : "/auth/3");
  };

  /**
   * Form submit handler
   * @param data Form data
   * @returns Nothing
   */
  const onSubmit = async (data: FormSchema) => await verify(data.code);

  return (
    <AuthContainer back={true}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="code"
          render={({
            field: {onChange, onBlur, value},
            fieldState: {error, isTouched, invalid},
          }) => (
            <IonInput
              className={`min-w-64 mb-4 ${
                (invalid || isTouched) && "ion-touched"
              } ${invalid && "ion-invalid"} ${
                !invalid && isTouched && "ion-valid"
              }`}
              errorText={error?.message}
              fill="outline"
              label="Code"
              labelPlacement="floating"
              onIonBlur={onBlur}
              onIonChange={onChange}
              type="text"
              value={value}
            />
          )}
        />

        <IonButton
          className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
          expand="full"
          type="submit"
        >
          <IonIcon slot="start" ios={checkmarkOutline} md={checkmarkSharp} />
          Verify Code
        </IonButton>
      </form>
    </AuthContainer>
  );
};
