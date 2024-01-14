/**
 * @file Error page
 */

import {IonButton, IonContent, IonIcon, IonPage} from "@ionic/react";
import {homeOutline, homeSharp} from "ionicons/icons";
import {FC} from "react";

import {Header} from "~/components/header";

/**
 * Error page props
 */
interface ErrorProps {
  /**
   * Error name
   */
  name: string;

  /**
   * Error description
   */
  description: string;

  /**
   * Whether or not to show the home button
   */
  homeButton: boolean;
}

/**
 * Error page
 * @returns JSX
 */
export const Error: FC<ErrorProps> = ({name, description, homeButton}) => {
  return (
    <IonPage>
      <Header />

      <IonContent>
        <div className="flex flex-col h-full items-center justify-center text-center w-full">
          <h1 className="text-6xl">{name}</h1>
          <p className="my-4 text-xl">{description}</p>
          {homeButton && (
            <IonButton routerLink="/">
              <IonIcon slot="start" ios={homeOutline} md={homeSharp} />
              Take me home
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
