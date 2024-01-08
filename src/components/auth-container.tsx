/**
 * @file Auth page container component
 */

import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

/**
 * Auth page container component props
 */
interface AuthContainerProps {
  /**
   * Whether to show the back button or the menu button
   */
  back: boolean;

  /**
   * Children
   */
  children: React.ReactNode;
}

/**
 * Auth page container component
 * @param props Props
 * @returns JSX
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({
  back,
  children,
}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          {back ? <IonBackButton defaultHref="/auth/1" /> : <IonMenuButton />}
        </IonButtons>

        <IonTitle>Authentication</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Authentication</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>{children}</IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  </IonPage>
);
