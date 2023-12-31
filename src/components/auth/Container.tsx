/**
 * @file Auth page container
 */

import {
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

export interface ContainerProps {
  /**
   * Children
   */
  children: React.ReactNode;
}

/**
 * Auth page container component
 * @param props Props
 * @param props.children Children
 * @returns JSX
 */
export const Container: React.FC<ContainerProps> = ({children}) => (
  <IonPage>
    <IonHeader className="ion-no-border" translucent={true}>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>

        <IonTitle>Authentication</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent forceOverscroll={false}>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <IonCard>
          <IonCardHeader className="text-center">
            <IonCardTitle>Authentication</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>{children}</IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  </IonPage>
);
