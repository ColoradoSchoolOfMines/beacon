/**
 * @file Create post page container component
 */
/* eslint-disable jsdoc/require-jsdoc */

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {FC, ReactNode} from "react";

import styles from "~/components/create-post-container.module.css";

/**
 * Create post page container component props
 */
interface CreatePostContainerProps {
  /**
   * Children
   */
  children: ReactNode;
}

/**
 * Create post page container component
 * @param props Props
 * @returns JSX
 */
export const CreatePostContainer: FC<CreatePostContainerProps> = ({
  children,
}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/nearby" />
        </IonButtons>

        <IonTitle>Create Post</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className={styles.content}>{children}</IonContent>
  </IonPage>
);
