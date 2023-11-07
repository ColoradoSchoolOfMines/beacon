/**
 * @file Index page
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
 * Index page component
 * @returns JSX
 */
export const Index: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="none">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false}>
        <div className="-z-1 bg-gradient-to-b bottom-0 fixed from-50% from-black left-0 right-0 to-primary-500 top-0" />
        <div className="flex flex-col items-center justify-center h-full w-full">
          <h1 className="animate-fade-in text-4xl text-light">
            Introducing Beacon
          </h1>
        </div>
      </IonContent>
    </IonPage>
  );
};
