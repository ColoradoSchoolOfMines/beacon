/**
 * @file Markdown page
 */

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {FC} from "react";
import {useAsync} from "react-use";

import {Markdown as MarkdownRenderer} from "~/components/markdown";

/**
 * Markdown page props
 */
interface MarkdownProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Markdown URL (relative or absolute)
   */
  url: string;
}

/**
 * Markdown page
 * @returns JSX
 */
export const Markdown: FC<MarkdownProps> = ({title, url}) => {
  // Hooks
  const markdown = useAsync(async () => {
    // Fetch the markdown
    const response = await fetch(url);

    // Convert the response to text
    return await response.text();
  });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>

          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <MarkdownRenderer
          className="break-anywhere h-full overflow-auto p-2 text-wrap w-full"
          raw={
            markdown.loading
              ? "Loading..."
              : markdown.value ?? `Failed to load ${title}.`
          }
        />
      </IonContent>
    </IonPage>
  );
};
