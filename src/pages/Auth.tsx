/**
 * @file Auth page
 */

import HCaptcha from "@hcaptcha/react-hcaptcha";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {logInOutline, logInSharp} from "ionicons/icons";
import {isValidPhoneNumber, parsePhoneNumber} from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.min.json";
import {Ref, useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {Theme} from "~/lib/types";
import {HCAPTCHA_SITEKEY} from "~/lib/vars";

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

/**
 * Auth page component
 * @returns JSX
 */
export const Auth: React.FC = () => {
  // Hooks
  const history = useHistory();
  const captcha = useRef<HCaptcha>();
  const setError = useStore(state => state.setError);
  const theme = useStore(state => state.theme);

  const {control, handleSubmit, setValue} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Methods
  /**
   * Log in
   * @param data Form data
   */
  const login = async (data: FormSchema) => {
    // Parse the phone number
    const phoneNumber = parsePhoneNumber(data.phoneNumber, "US", metadata);

    // Log in
    const {error} = await client.auth.signInWithOtp({
      phone: phoneNumber.number,
      options: {
        captchaToken: data.captchaToken,
      },
    });

    // Handle the error
    if (error !== null) {
      // Reset the captcha
      setValue("captchaToken", "");
      captcha.current?.resetCaptcha();

      // Show the error
      setError({
        name: "Failed to log in",
        description: error.message,
      });

      return;
    }

    // Navigate to the nearby page
    history.push("/nearby");
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Auth</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false}>
        <div className="flex flex-col items-center justify-center h-full w-full">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Log In</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleSubmit(login)}>
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
                      } ${invalid ? "ion-invalid" : "ion-valid"}`}
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
                  render={({
                    field: {onChange},
                    fieldState: {invalid, error},
                  }) => (
                    <>
                      <div
                        className="overflow-hidden m-[-4px]"
                        style={{clipPath: "inset(4px round 8px)"}}
                      >
                        <HCaptcha
                          onVerify={token => onChange(token)}
                          ref={captcha as Ref<HCaptcha>}
                          sitekey={HCAPTCHA_SITEKEY}
                          theme={theme === Theme.DARK ? "dark" : "light"}
                        />
                      </div>
                      {invalid && (
                        <p className="!text-[12px] pt-1.5 text-[#ff4961]">
                          {error?.message}
                        </p>
                      )}
                    </>
                  )}
                />

                <IonButton
                  className="mx-0 mt-4 overflow-hidden rounded-lg w-full"
                  expand="full"
                  type="submit"
                >
                  <IonIcon slot="start" ios={logInOutline} md={logInSharp} />
                  Log In
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};
