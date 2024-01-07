/**
 * @file Auth step 3 component
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {checkmarkOutline, checkmarkSharp} from "ionicons/icons";
import {useContext} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {AuthContainer} from "~/components/auth/Container";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {AuthNavContext} from "~/pages/Auth";

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
 * Auth step 3 component
 * @returns JSX
 */
export const Step3: React.FC = () => {
  // Hooks
  const email = useStore(state => state.email);
  const setMessage = useStore(state => state.setMessage);
  const history = useHistory();
  const nav = useContext(AuthNavContext);

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
    const {error} = await client.auth.verifyOtp({
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
        name: "Failed to log in",
        description: error.message,
      });

      // Go back to the previous step
      nav?.pop();

      return;
    }

    // Go to nearby
    history.push("/nearby");
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
