/**
 * @file Auth step 1
 */

import {IonButton, IonIcon, IonNote} from "@ionic/react";
import {callOutline, callSharp, keyOutline, keySharp} from "ionicons/icons";

import {checkPasskeySupport, getPasskey} from "~/lib/auth";
import {AuthStep} from "~/pages/Auth";

export interface Step1Props {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
}

/**
 * Auth step 1 component
 * @returns JSX
 */
export const Step1: React.FC<Step1Props> = ({setStep}) => {
  // Methods
  /**
   * Attempt to use a passkey to login
   */
  const usePasskey = async () => {
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

  return (
    <>
      {checkPasskeySupport() && (
        <>
          <IonButton
            className="m-0 overflow-hidden rounded-lg w-full"
            color="primary"
            expand="full"
            onClick={usePasskey}
          >
            <IonIcon slot="start" ios={keyOutline} md={keySharp} />
            Authenticate With Passkey
          </IonButton>

          <IonNote className="block mt-2 text-center">
            Log into an <b>existing</b> account with a passkey.
          </IonNote>

          <div className="after:border-b-1 after:border-solid after:content-[''] after:flex-1 after:ml-4 before:border-b-1 before:border-solid before:content-[''] before:flex-1 before:mr-4 flex items-center my-4">
            <p>Or</p>
          </div>
        </>
      )}
      <IonButton
        className="m-0 overflow-hidden rounded-lg w-full"
        color="secondary"
        expand="full"
        onClick={() => setStep(AuthStep.STEP2B)}
      >
        <IonIcon slot="start" ios={callOutline} md={callSharp} />
        Authenticate With Phone
      </IonButton>

      <IonNote className="block mt-2 text-center">
        Create a <b>new</b> account or log into an <b>existing</b> account with
        a phone.
      </IonNote>
    </>
  );
};
