import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

/**
 * Settings page component
 * @returns JSX
 */
export const Settings: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false} fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <p className="h-[500vh]">Hello, world!</p>
      </IonContent>
    </IonPage>
  );
};
