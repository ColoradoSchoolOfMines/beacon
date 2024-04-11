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
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {FC, ReactNode} from "react";

/**
 * Auth page container component props
 */
interface AuthContainerProps {
  /**
   * Children
   */
  children: ReactNode;
}

/**
 * Auth page container component
 * @param props Props
 * @returns JSX
 */
export const AuthContainer: FC<AuthContainerProps> = ({children}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/" />
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
