/**
 * @file Global message component
 */

import {IonAlert} from "@ionic/react";

import {useStore} from "~/lib/stores/global";

/**
 * Global message component
 * @returns JSX
 */
export const GlobalMessage: React.FC = () => {
  // Hooks
  const message = useStore(state => state.message);
  const setMessage = useStore(state => state.setMessage);

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
