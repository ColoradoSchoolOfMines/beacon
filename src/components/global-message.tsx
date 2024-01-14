/**
 * @file Global message component
 */

import {IonAlert} from "@ionic/react";
import {FC} from "react";

import {useMiscellaneousStore} from "~/lib/stores/miscellaneous";

/**
 * Global message component
 * @returns JSX
 */
export const GlobalMessage: FC = () => {
  // Hooks
  const message = useMiscellaneousStore(state => state.message);
  const setMessage = useMiscellaneousStore(state => state.setMessage);

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
