/**
 * @file Auth page container component
 */

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonPage,
} from "@ionic/react";

import {Header} from "~/components/Header";

/**
 * Auth page container component props
 */
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
    <Header />

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
