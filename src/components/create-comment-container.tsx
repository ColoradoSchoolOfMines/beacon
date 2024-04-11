/**
 * @file Create comment page container component
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

import styles from "~/components/create-comment-container.module.css";
import {Post} from "~/lib/types";

/**
 * Create comment page container component props
 */
interface CreateCommentContainerProps {
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
  post,
  children,
}) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton
            defaultHref={post === undefined ? undefined : `/posts/${post.id}`}
          />
        </IonButtons>

        <IonTitle>Create Comment</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className={styles.content}>{children}</IonContent>
  </IonPage>
);
