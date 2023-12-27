/**
 * @file Auth step 3A
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {checkmarkOutline, checkmarkSharp} from "ionicons/icons";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {AuthStep} from "~/pages/Auth";

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

export interface Step3AProps {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
}

/**
 * Auth step 3A component
 * @returns JSX
 */
export const Step3A: React.FC<Step3AProps> = ({setStep}) => {
  // Hooks
  const email = useStore(state => state.email);
  const setError = useStore(state => state.setError);

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
      type: "magiclink",
    });

    // Handle the error
    if (error !== null) {
      // Reset the form
      reset();

      // Show the error
      setError({
        name: "Failed to log in",
        description: error.message,
      });

      return;
    }

    // Go to the next step
    setStep(AuthStep.STEP4A);
  };

  /**
   * Form submit handler
   * @param data Form data
   * @returns Nothing
   */
  const onSubmit = async (data: FormSchema) => await verify(data.code);

  return (
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
            onIonInput={onChange}
            type="number"
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
  );
};
