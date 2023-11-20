/**
 * @file Auth step 4B
 */

import {IonButton, IonIcon, IonNote} from "@ionic/react";
import {
  checkmarkOutline,
  checkmarkSharp,
  closeOutline,
  closeSharp,
} from "ionicons/icons";
import {useHistory} from "react-router";

import {getPasskey} from "~/lib/auth";
import {AuthStep} from "~/pages/Auth";

export interface Step4BProps {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
}

/**
 * Auth step 4B component
 * @returns JSX
 */
export const Step4B: React.FC<Step4BProps> = ({setStep}) => {
  // Hooks
  const history = useHistory();

  // Methods
  /**
   * Setup a passkey
   */
  const setup = async () => {
    let passkey: Credential | undefined;

    try {
      passkey = await getPasskey([
        3,
        4,
        5,
      ]);
    } catch (error) {
      console.warn("Failed to get passkey", error);
      return;
    }

    console.log(passkey);
  };

  /**
   * Skip passkey setup
   */
  const skip = () => {
    history.push("/nearby");
  };

  return (
    <>
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
    </>
  );
};
