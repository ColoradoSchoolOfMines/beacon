/**
 * @file Global message component
 */

import {IonAlert} from "@ionic/react";
import {FC} from "react";

import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";

/**
 * Global message component
 * @returns JSX
 */
export const GlobalMessage: FC = () => {
  // Hooks
  const message = useEphemeralUIStore(state => state.message);
  const setMessage = useEphemeralUIStore(state => state.setMessage);

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
