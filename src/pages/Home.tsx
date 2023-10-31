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
 * Home page component
 * @returns JSX
 */
export const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false} fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <p className="text-red dark:text-green h-[500vh]">Hello, world!</p>
      </IonContent>
    </IonPage>
  );
};
