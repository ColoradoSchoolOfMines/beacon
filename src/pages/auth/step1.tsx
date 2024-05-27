/**
 * @file Auth step 1 page
 */

import HCaptcha from "@hcaptcha/react-hcaptcha";
import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {paperPlaneOutline, paperPlaneSharp} from "ionicons/icons";
import {FC, useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {AuthContainer} from "~/components/auth-container";
import {SupplementalError} from "~/components/supplemental-error";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {Theme, UserMetadata} from "~/lib/types";
import {HCAPTCHA_SITE_KEY} from "~/lib/vars";

/**
 * Form schema
 */
const formSchema = z.object({
  email: z.string().email(),
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
 * Auth step 1 component
 * @returns JSX
 */
export const Step1: FC = () => {
  // Hooks
  const captcha = useRef<HCaptcha>(null);
  const setEmail = useEphemeralStore(state => state.setEmail);
  const theme = usePersistentStore(state => state.theme);
  const history = useHistory();

  const {control, handleSubmit, reset} = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  // Methods
  /**
   * Form submit handler
   * @param form Form data
   */
  const onSubmit = async (form: FormSchema) => {
    // Store the email for later
    setEmail(form.email);

    // Begin the log in process
    const {error} = await client.auth.signInWithOtp({
      email: form.email,
      options: {
        captchaToken: form.captchaToken,
        emailRedirectTo: new URL("/auth/2", window.location.origin).toString(),
        data: {
          acceptedTerms: false,
        } as UserMetadata,
      },
    });

    // Handle the error
    if (error !== null) {
      // Partially reset the form
      reset({
        email: form.email,
      });

      // Reset the captcha
      captcha.current?.resetCaptcha();

      return;
    }

    // Go to the next step
    history.push("/auth/2");
  };

  return (
    <AuthContainer back={true}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="email"
          render={({
            field: {onChange, onBlur, value},
            fieldState: {error, isTouched, invalid},
          }) => (
            <IonInput
              className={`min-w-64 ${(invalid || isTouched) && "ion-touched"} ${
                invalid && "ion-invalid"
              } ${!invalid && isTouched && "ion-valid"}`}
              errorText={error?.message}
              fill="outline"
              label="Email"
              labelPlacement="floating"
              onIonBlur={onBlur}
              onIonInput={onChange}
              type="email"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="captchaToken"
          render={({field: {onChange}, fieldState: {error}}) => (
            <div className="py-4">
              <HCaptcha
                onVerify={token => onChange(token)}
                ref={captcha}
                sitekey={HCAPTCHA_SITE_KEY}
                theme={theme === Theme.DARK ? "dark" : "light"}
              />
              <SupplementalError error={error?.message} />
            </div>
          )}
        />
        <IonButton
          className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
          expand="full"
          type="submit"
        >
          <IonIcon slot="start" ios={paperPlaneOutline} md={paperPlaneSharp} />
          Send Login Code
        </IonButton>
      </form>
    </AuthContainer>
  );
};
