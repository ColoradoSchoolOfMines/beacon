/**
 * @file Auth step 3 page
 */

import {IonButton, IonIcon} from "@ionic/react";
import {
  checkmarkOutline,
  checkmarkSharp,
  closeOutline,
  closeSharp,
} from "ionicons/icons";
import {FC, FormEvent} from "react";
import {useHistory} from "react-router-dom";

import {AuthContainer} from "~/components/auth-container";
import {client} from "~/lib/supabase";
import {UserMetadata} from "~/lib/types";

/**
 * Auth step 3 component
 * @returns JSX
 */
export const Step3: FC = () => {
  // Hooks
  const history = useHistory();

  // Methods
  /**
   * Form submit handler
   * @param event Form event
   * @returns Nothing
   */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Update the user's terms and conditions agreement
    const {error} = await client.auth.updateUser({
      data: {
        acceptedTerms: true,
      } as UserMetadata,
    });

    // Handle the error
    if (error !== null) {
      return;
    }

    // Go to nearby
    history.push("/nearby");
  };

  /**
   * Reject button click handler
   */
  const reject = () => {
    // Log out
    client.auth.signOut();

    // Go to home
    history.push("/");
  };

  return (
    <AuthContainer back={true}>
      <form onSubmit={onSubmit}>
        <p>
          You agree to the{" "}
          <a
            className="font-bold underline"
            target="_blank"
            href="/terms-and-conditions"
          >
            terms and conditions
          </a>{" "}
          and{" "}
          <a
            className="font-bold underline"
            target="_blank"
            href="/privacy-policy"
          >
            privacy policy
          </a>{" "}
          of this app. This includes (but is not limited to):
        </p>

        <ul className="list-disc list-inside my-1">
          <li>
            We reserve the right to remove any content and ban any user at any
            time at our own discretion.
          </li>
          <li>Violating the terms and conditions will result in a ban.</li>
          <li>
            We collect your geolocation data to filter content to your location.
          </li>
        </ul>

        <IonButton
          className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
          expand="full"
          type="submit"
        >
          <IonIcon slot="start" ios={checkmarkOutline} md={checkmarkSharp} />
          Agreee
        </IonButton>
        <IonButton
          className="mb-0 mt-4 mx-0 overflow-hidden rounded-lg w-full"
          color="danger"
          expand="full"
          onClick={reject}
        >
          <IonIcon slot="start" ios={closeOutline} md={closeSharp} />
          Reject
        </IonButton>
      </form>
    </AuthContainer>
  );
};
