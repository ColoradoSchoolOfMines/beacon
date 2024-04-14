/**
 * @file Terms and conditions page
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
 * Terms and conditions page
 * @returns JSX
 */
export const Terms: FC = () => {
  // Hooks
  const termsAndConditions = useAsync(async () => {
    // Fetch the terms and conditions
    const response = await fetch("/custom/terms-and-conditions.md");

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

          <IonTitle>Terms and Conditions</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Markdown
          className="break-anywhere h-full overflow-auto p-2 text-wrap w-full whitespace-pre"
          raw={
            termsAndConditions.loading
              ? "Loading..."
              : termsAndConditions.value ??
                "Failed to load terms and conditions."
          }
        />
      </IonContent>
    </IonPage>
  );
};
