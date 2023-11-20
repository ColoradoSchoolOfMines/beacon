/**
 * @file Auth step 2B
 */

import HCaptcha from "@hcaptcha/react-hcaptcha";
import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {paperPlaneOutline, paperPlaneSharp} from "ionicons/icons";
import {isValidPhoneNumber, parsePhoneNumber} from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.min.json";
import {useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {Theme} from "~/lib/types";
import {HCAPTCHA_SITEKEY} from "~/lib/vars";
import {AuthStep} from "~/pages/Auth";

/**
 * Form schema
 */
const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(1)
    .refine(value => isValidPhoneNumber(value, "US", metadata), {
      message: "Invalid phone number",
    }),
  captchaToken: z
    .string({
      // eslint-disable-next-line camelcase
      required_error: "Please complete the challenge",
    })
    .min(1, "Please complete the challenge"),
});

/**
 * Form schema type
 */
type FormSchema = z.infer<typeof formSchema>;

export interface Step2BProps {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
}

/**
 * Auth step 2B component
 * @returns JSX
 */
export const Step2B: React.FC<Step2BProps> = ({setStep}) => {
  // Hooks
  const captcha = useRef<HCaptcha>(null);
  const setError = useStore(state => state.setError);
  const setPhoneNumber = useStore(state => state.setPhoneNumber);
  const theme = useStore(state => state.theme);

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Methods
  /**
   * Form submit handler
   * @param data Form data
   */
  const onSubmit = async (data: FormSchema) => {
    // Parse the phone number
    const phoneNumber = parsePhoneNumber(data.phoneNumber, "US", metadata);
    setPhoneNumber(phoneNumber);

    // Log in
    const {error} = await client.auth.signInWithOtp({
      phone: phoneNumber!.number,
      options: {
        captchaToken: data.captchaToken,
        shouldCreateUser: true,
      },
    });

    // Handle the error
    if (error !== null) {
      // Partially reset the form
      reset({
        phoneNumber: data.phoneNumber,
      });

      // Reset the captcha
      captcha.current?.resetCaptcha();

      // Show the error
      setError({
        name: "Failed to log in",
        description: error.message,
      });

      return;
    }

    // Go to the next step
    setStep(AuthStep.STEP3B);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="phoneNumber"
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
            label="Phone Number"
            labelPlacement="floating"
            onIonBlur={onBlur}
            onIonInput={onChange}
            type="tel"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="captchaToken"
        render={({field: {onChange}, fieldState: {invalid, error}}) => (
          <>
            <HCaptcha
              onVerify={token => onChange(token)}
              ref={captcha}
              sitekey={HCAPTCHA_SITEKEY}
              theme={theme === Theme.DARK ? "dark" : "light"}
            />
            {invalid && (
              <p className="!text-[12px] pt-1.5 text-[#ff4961]">
                {error?.message}
              </p>
            )}
          </>
        )}
      />

      <IonButton
        className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
        expand="full"
        type="submit"
      >
        <IonIcon slot="start" ios={paperPlaneOutline} md={paperPlaneSharp} />
        Send Code
      </IonButton>
    </form>
  );
};
