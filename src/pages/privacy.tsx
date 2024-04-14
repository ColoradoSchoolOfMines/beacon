/**
 * @file Privacy policy page
 */

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {FC} from "react";
import {useAsync} from "react-use";

import {Markdown} from "~/components/markdown";

/**
 * Privacy policy page
 * @returns JSX
 */
export const Privacy: FC = () => {
  // Hooks
  const privacyPolicy = useAsync(async () => {
    // Fetch the privacy policy
    const response = await fetch("/custom/privacy-policy.md");

    // Convert the response to text
    return await response.text();
  });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Privacy Policy</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Markdown
          className="break-anywhere h-full overflow-auto p-2 text-wrap w-full whitespace-pre"
          raw={
            privacyPolicy.loading
              ? "Loading..."
              : privacyPolicy.value ?? "Failed to load privacy policy."
          }
        />
      </IonContent>
    </IonPage>
  );
};
