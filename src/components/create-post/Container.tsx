/**
 * @file ACreate post page container component
 */

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

import styles from "~/components/create-post/Container.module.css";

/**
 * Create post page container component props
 */
export interface CreatePostContainerProps {
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
 * Create post page container component
 * @param props Props
 * @param props.back Whether to show the back button or the menu button
 * @param props.children Children
 * @returns JSX
 */
export const CreatePostContainer: React.FC<CreatePostContainerProps> = ({
  back,
  children,
}) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          {back ? (
            <IonBackButton defaultHref="/posts/create" />
          ) : (
            <IonMenuButton />
          )}
        </IonButtons>

        <IonTitle>Create Post</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className={styles.content} forceOverscroll={false}>
      {children}
    </IonContent>
  </IonPage>
);
