/**
 * @file Auth step 2A component
 */

import HCaptcha from "@hcaptcha/react-hcaptcha";
import {zodResolver} from "@hookform/resolvers/zod";
import {IonButton, IonIcon, IonInput} from "@ionic/react";
import {paperPlaneOutline, paperPlaneSharp} from "ionicons/icons";
import {useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import {useHistory} from "react-router-dom";
import {z} from "zod";

import {Container} from "~/components/auth/Container";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {Theme} from "~/lib/types";
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
 * Auth step 2A component
 * @returns JSX
 */
export const Step2A: React.FC = () => {
  // Hooks
  const captcha = useRef<HCaptcha>(null);
  const history = useHistory();
  const setEmail = useStore(state => state.setEmail);
  const theme = useStore(state => state.theme);

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
        emailRedirectTo: new URL(
          "/auth/step/4a",
          window.location.origin,
        ).toString(),
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
    history.push("/auth/step/3a");
  };

  return (
    <Container>
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
          render={({field: {onChange}, fieldState: {error, invalid}}) => (
            <div className="py-4">
              <HCaptcha
                onVerify={token => onChange(token)}
                ref={captcha}
                sitekey={HCAPTCHA_SITE_KEY}
                theme={theme === Theme.DARK ? "dark" : "light"}
              />
              {invalid && (
                <p className="!text-[12px] pt-1.5 text-[#ff4961]">
                  {error?.message}
                </p>
              )}
            </div>
          )}
        />
        <IonButton
          className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
          expand="full"
          type="submit"
        >
          <IonIcon slot="start" ios={paperPlaneOutline} md={paperPlaneSharp} />
          Send Login Link
        </IonButton>
      </form>
    </Container>
  );
};
