/**
 * @file Privacy policy page
 */

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {FC} from "react";

import {Markdown} from "~/components/markdown";
import {PRIVACY_POLICY} from "~/lib/vars";

/**
 * Privacy policy page
 * @returns JSX
 */
export const Privacy: FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Privacy Policy</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Markdown
          className="break-anywhere h-full overflow-auto p-2 text-wrap w-full whitespace-pre"
          raw={PRIVACY_POLICY}
        />
      </IonContent>
    </IonPage>
  );
};
