/**
 * @file Global message component
 */

import {IonAlert} from "@ionic/react";
import {FC} from "react";

import {useEphemeralStore} from "~/lib/stores/ephemeral";

/**
 * Global message component
 * @returns JSX
 */
export const GlobalMessage: FC = () => {
  // Hooks
  const message = useEphemeralStore(state => state.message);
  const setMessage = useEphemeralStore(state => state.setMessage);

  // JSX
  return (
    <IonAlert
      isOpen={message !== undefined}
      header={message?.name}
      subHeader={message?.description}
      buttons={["OK"]}
      onIonAlertDidDismiss={() => setMessage()}
    />
  );
};
