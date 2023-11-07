/**
 * @file Nearby page
 */

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonToolbar,
} from "@ionic/react";

/**
 * Nearby page component
 * @returns JSX
 */
export const Nearby: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar color="none">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false} fullscreen={true}>
        <p className="text-red dark:text-green h-[500vh]">Hello, world!</p>
      </IonContent>
    </IonPage>
  );
};
