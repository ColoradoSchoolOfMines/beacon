/**
 * @file Create comment page container component
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

import styles from "~/components/create-comment-container.module.css";
import {Post} from "~/lib/types";

/**
 * Create comment page container component props
 */
interface CreateCommentContainerProps {
  /**
   * Whether to show the back button or the menu button
   */
  back: boolean;

  /**
   * Parent post
   */
  post?: Post;

  /**
   * Children
   */
  children: ReactNode;
}

/**
 * Create comment page container component
 * @param props Props
 * @returns JSX
 */
export const CreateCommentContainer: FC<CreateCommentContainerProps> = ({
  back,
  post,
  children,
}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          {back ? (
            <IonBackButton
              defaultHref={post === undefined ? undefined : `/posts/${post.id}`}
            />
          ) : (
            <IonMenuButton />
          )}
        </IonButtons>

        <IonTitle>Create Comment</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className={styles.content}>{children}</IonContent>
  </IonPage>
);
