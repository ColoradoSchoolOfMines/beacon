/**
 * @file Auth step 1
 */

import {IonButton, IonIcon, IonNote} from "@ionic/react";
import {startAuthentication} from "@simplewebauthn/browser";
import {AuthenticationResponseJSON} from "@simplewebauthn/typescript-types";
import {callOutline, callSharp, keyOutline, keySharp} from "ionicons/icons";
import {useHistory} from "react-router-dom";

import {Container} from "~/components/auth/Container";
import {
  beginAuthentication,
  checkPasskeySupport,
  endAuthentication,
} from "~/lib/api/auth";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";

/**
 * Auth step 1 component
 * @returns JSX
 */
export const Step1: React.FC = () => {
  // Hooks
  const history = useHistory();
  const setError = useStore(state => state.setError);

  // Methods
  /**
   * Attempt to use a passkey to login
   */
  const usePasskey = async () => {
    // Begin the authentication
    const beginRes = await beginAuthentication();

    // Handle error
    if (!beginRes.ok) {
      return;
    }

    // Generate the credential
    let response: AuthenticationResponseJSON | undefined = undefined;

    try {
      response = await startAuthentication(beginRes.options!);
    } catch {
      // Empty
    }

    if (response === undefined) {
      setError({
        name: "Passkey Error",
        description: "Failed to create credential",
      });

      return;
    }

    // End the authentication
    const endRes = await endAuthentication(
      beginRes.challengeId!,
      response.id,
      response,
    );

    // Handle error
    if (!endRes) {
      return;
    }

    // Update the session
    await client.auth.setSession({
      // eslint-disable-next-line camelcase
      access_token: endRes.session!.access_token,
      // eslint-disable-next-line camelcase
      refresh_token: endRes.session!.refresh_token,
    });

    // Go to nearby
    history.push("/nearby");
  };

  /**
   * Attempt to use an email to login
   */
  const useEmail = () => {
    // Go to the next step
    history.push("/auth/step/2a");
  };

  return (
    <Container>
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
        onClick={useEmail}
      >
        <IonIcon slot="start" ios={callOutline} md={callSharp} />
        Authenticate With Email
      </IonButton>

      <IonNote className="block mt-2 text-center">
        Create a <b>new</b> account or log into an <b>existing</b> account with
        an email address.
      </IonNote>
    </Container>
  );
};
