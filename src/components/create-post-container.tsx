/**
 * @file Create post page container component
 */
/* eslint-disable jsdoc/require-jsdoc */

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
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
   * Whether to show the back button or the menu button
   */
  back: boolean;

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
  back,
  children,
}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          {back ? (
            <IonBackButton defaultHref="/posts/create/1" />
          ) : (
            <IonMenuButton />
          )}
        </IonButtons>

        <IonTitle>Create Post</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className={styles.content}>{children}</IonContent>
  </IonPage>
);
