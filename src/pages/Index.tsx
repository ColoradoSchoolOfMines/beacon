/**
 * @file Index page
 */

import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  ScrollDetail,
} from "@ionic/react";
import {compassOutline, compassSharp} from "ionicons/icons";
import {useState} from "react";

/**
 * Number of frames
 */
const FRAME_COUNT = 4;

/**
 * Index page component
 * @returns JSX
 */
export const Index: React.FC = () => {
  // Hooks
  const [effectProgress, setEffectProgress] = useState<number>(
    (FRAME_COUNT - 1) / FRAME_COUNT,
  );

  // Methods
  /**
   * Scroll event handler
   * @param event Scroll event
   */
  const onScroll = (event: CustomEvent<ScrollDetail>) => {
    // Get the target element
    const target = event.target as HTMLElement;

    // Update the effect progress
    setEffectProgress(
      1 -
        (event.detail.scrollTop + target.scrollHeight) /
          (target.scrollHeight * FRAME_COUNT),
    );
  };

  return (
    <IonPage>
      <IonContent
        forceOverscroll={false}
        onIonScroll={onScroll}
        scrollEvents={true}
      >
        {/* Background gradient */}
        <div
          className="-z-1 bg-gradient-to-b bottom-0 fixed from-black left-0 right-0 to-primary-500 top-0"
          style={
            {
              "--un-gradient-from-position": `${Math.round(
                100 * effectProgress,
              )}%`,
            } as Record<string, string>
          }
        />

        {/* First frame */}
        <div className="animate-[fade-in_2s_ease-in-out_1] flex flex-col h-[100vh] items-center justify-center px-6 text-center w-full">
          <div className="my-2 text-light">
            <h1 className="mb-1 text-4xl">Introducing Beacon</h1>
            <h2 className="mt-1 text-xl">A location-based social network.</h2>
          </div>

          <IonButton
            className="my-2"
            color="primary"
            fill="outline"
            routerLink="/auth"
          >
            <IonIcon slot="start" ios={compassOutline} md={compassSharp} />
            Get Started
          </IonButton>
        </div>

        {/* Second frame */}
        <div className="flex flex-col h-[100vh] items-center justify-center px-6 text-center text-light w-full">
          <h2 className="mb-1 text-4xl">1. Create A Post</h2>
          <h3 className="mt-1 text-m">
            Every post can only be seen by other users nearby - you decide how
            close they need to be.
          </h3>
        </div>

        {/* Third frame */}
        <div className="flex flex-col h-[100vh] items-center justify-center px-6 text-center text-light w-full">
          <h2 className="mb-1 text-4xl">2. View Other Posts</h2>
          <h3 className="mt-1 text-m">
            View nearby posts and interact with them by commenting, upvoting,
            and downvoting them.
          </h3>
        </div>

        {/* Fourth frame */}
        <div className="flex flex-col h-[100vh] items-center justify-center px-6 text-center text-light w-full">
          <h2 className="mb-1 text-4xl">3. Remain Anonymous</h2>
          <h3 className="mt-1 text-m">
            You can choose to remain anonymous when creating posts and
            commenting on other posts.
          </h3>
        </div>
      </IonContent>
    </IonPage>
  );
};
