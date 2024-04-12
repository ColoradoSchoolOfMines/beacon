/**
 * @file Terms and conditions page
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
import {TERMS_AND_CONDITIONS} from "~/lib/vars";

/**
 * Terms and conditions page
 * @returns JSX
 */
export const Terms: FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Terms and Conditions</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Markdown
          className="break-anywhere h-full overflow-auto p-2 text-wrap w-full whitespace-pre"
          raw={TERMS_AND_CONDITIONS}
        />
      </IonContent>
    </IonPage>
  );
};
