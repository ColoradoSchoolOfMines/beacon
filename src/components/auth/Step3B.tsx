/**
 * @file Auth step #B
 */

import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {checkmarkOutline, checkmarkSharp} from "ionicons/icons";
import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router";
import {z} from "zod";

import {checkOtpSupport, checkPasskeySupport, getOtp} from "~/lib/auth";
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
    .refine(value => Number.isNaN(Number.parseInt(value)), {
      message: "Invalid code",
    }),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

export interface Step3BProps {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
}

/**
 * Auth step 3B component
 * @returns JSX
 */
export const Step3B: React.FC<Step3BProps> = ({setStep}) => {
  // Hooks
  const history = useHistory();
  const phoneNumber = useStore(state => state.phoneNumber);
  const setError = useStore(state => state.setError);

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Effects
  useEffect(() => {
    (async () => {
      // Attempt to get the OTP automatically
      if (!checkOtpSupport()) {
        console.warn("Automatic OTP retrieval is not supported!");
        return;
      }

      let otp: string | undefined;

      try {
        otp = await getOtp();
      } catch (error) {
        console.warn(error);
        return;
      }

      if (otp !== undefined) {
        await verify(otp);
      }
    })();
  }, []);

  // Methods
  /**
   * Verify the code
   * @param code Code
   */
  const verify = async (code: string) => {
    // Log in
    const {error} = await client.auth.verifyOtp({
      phone: phoneNumber?.number as string,
      token: code,
      type: "sms",
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
    if (checkPasskeySupport()) {
      setStep(AuthStep.STEP4B);
    } else {
      history.push("/nearby");
    }
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
