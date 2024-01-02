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
export interface AuthContainerProps {
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
 * @param props.back Whether to show the back button or the menu button
 * @param props.children Children
 * @returns JSX
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({
  back,
  children,
}) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          {back ? <IonBackButton defaultHref="/auth" /> : <IonMenuButton />}
        </IonButtons>

        <IonTitle>Authentication</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent forceOverscroll={false}>
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
