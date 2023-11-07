/**
 * @file Error page
 */

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {homeOutline, homeSharp} from "ionicons/icons";

export interface ErrorProps {
  name: string;
  description: string;
  homeButton: boolean;
}

/**
 * Error page component
 * @returns JSX
 */
export const Error: React.FC<ErrorProps> = ({
  name: code,
  description,
  homeButton,
}) => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Error {code}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false}>
        <div className="flex flex-col items-center justify-center h-full w-full">
          <h1 className="text-8xl">{code}</h1>
          <p className="my-2 text-xl">{description}</p>
          {homeButton && (
            <IonButton routerLink="/">
              <IonIcon slot="start" ios={homeOutline} md={homeSharp} />
              Take me home
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
