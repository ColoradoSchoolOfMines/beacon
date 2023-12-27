/**
 * @file Auth step 4A
 */

import {IonButton, IonIcon, IonNote} from "@ionic/react";
import {
  checkmarkOutline,
  checkmarkSharp,
  closeOutline,
  closeSharp,
} from "ionicons/icons";
import {useHistory} from "react-router-dom";

import {Container} from "~/components/auth/Container";
import {beginAttestation, endAttestation} from "~/lib/api/auth";
import {useStore} from "~/lib/state";

/**
 * Auth step 4A component
 * @returns JSX
 */
export const Step4A: React.FC = () => {
  // Hooks
  const history = useHistory();
  const setError = useStore(state => state.setError);

  // Methods
  /**
   * Setup a passkey
   */
  const setup = async () => {
    // Begin the attestation
    let [
      challengeId,
      options,
      ok,
    ] = await beginAttestation();

    // Handle error
    if (!ok) {
      return;
    }

    // Create the credential
    const credential = (await navigator.credentials.create({
      publicKey: options,
    })) as PublicKeyCredential;

    const credentialResponse =
      credential.response as AuthenticatorAttestationResponse;

    // Handle error
    if (credential === null) {
      setError({
        name: "Passkey Error",
        description: "Failed to create credential",
      });

      return;
    }

    // End the attestation
    ok = await endAttestation(challengeId!, credential.id, {
      attestationObject: credentialResponse.attestationObject,
      clientDataJSON: credentialResponse.clientDataJSON,
    });

    // Handle error
    if (!ok) {
      return;
    }

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
