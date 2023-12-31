/**
 * @file Auth step 4A
 */

import {IonButton, IonIcon, IonNote} from "@ionic/react";
import {startRegistration} from "@simplewebauthn/browser";
import {RegistrationResponseJSON} from "@simplewebauthn/typescript-types";
import {
  checkmarkOutline,
  checkmarkSharp,
  closeOutline,
  closeSharp,
} from "ionicons/icons";
import {useHistory} from "react-router-dom";

import {Container} from "~/components/auth/Container";
import {beginRegistration, endRegistration} from "~/lib/api/auth";
import {useStore} from "~/lib/state";

/**
 * Auth step 4A component
 * @returns JSX
 */
export const Step4A: React.FC = () => {
  // Hooks
  const history = useHistory();
  const setMessage = useStore(state => state.setMessage);

  // Methods
  /**
   * Setup a passkey
   */
  const setup = async () => {
    // Begin the registration
    const beginRes = await beginRegistration();

    // Handle error
    if (!beginRes.ok) {
      return;
    }

    // Generate the credential
    let response: RegistrationResponseJSON | undefined = undefined;

    try {
      response = await startRegistration(beginRes.options!);
    } catch {
      // Empty
    }

    if (response === undefined) {
      // Display the message
      setMessage({
        name: "Passkey Error",
        description: "Failed to create credential",
      });

      return;
    }

    // End the registration
    const endRes = await endRegistration(beginRes.challengeId!, response);

    // Handle error
    if (!endRes) {
      return;
    }

    // Display the message
    setMessage({
      name: "Passkey Registered",
      description: "The passkey has been successfully registered",
    });

    // Go to nearby
    history.push("/nearby");
  };

  /**
   * Skip passkey setup
   */
  const skip = () => {
    // Go to nearby
    history.push("/nearby");
  };

  return (
    <Container>
      <IonButton
        className="m-0 overflow-hidden rounded-lg w-full"
        color="success"
        expand="full"
        onClick={setup}
      >
        <IonIcon slot="start" ios={checkmarkOutline} md={checkmarkSharp} />
        Setup A Passkey
      </IonButton>

      <IonNote className="block mt-2 text-center">
        Enjoy faster and more-secure logins with a <b>passkey</b>, a
        passwordless-key stored on your device that authenticates you with a
        single tap.
      </IonNote>

      <div className="after:border-b-1 after:border-solid after:content-[''] after:flex-1 after:ml-4 before:border-b-1 before:border-solid before:content-[''] before:flex-1 before:mr-4 flex items-center my-4">
        <p>Or</p>
      </div>

      <IonButton
        className="m-0 overflow-hidden rounded-lg w-full"
        color="danger"
        expand="full"
        onClick={skip}
      >
        <IonIcon slot="start" ios={closeOutline} md={closeSharp} />
        Skip For Now
      </IonButton>

      <IonNote className="block mt-2 text-center">
        Continue without setting up a passkey.
      </IonNote>
    </Container>
  );
};
