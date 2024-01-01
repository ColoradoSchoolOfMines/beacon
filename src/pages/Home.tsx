/**
 * @file Home page
 */

import {IonButton, IonContent, IonIcon, IonPage} from "@ionic/react";
import {compassOutline, compassSharp} from "ionicons/icons";
import {useMeasure} from "react-use";

import {Header} from "~/components/Header";
import {useStore} from "~/lib/state";
import {Theme} from "~/lib/types";
import styles from "~/pages/Home.module.css";

/**
 * Number of frames
 */
const FRAME_COUNT = 5;

/**
 * Home page
 * @returns JSX
 */
export const Home: React.FC = () => {
  // Hooks
  const theme = useStore(state => state.theme);
  const [content, {height, width}] = useMeasure();

  return (
    <IonPage ref={content}>
      <Header />

      <IonContent
        className={styles.snapContent}
        style={{
          "--window-height": `${height}px`,
        }}
      >
        {/* Background */}
        <div
          className="-z-1 absolute left-0 top-0 w-full"
          style={{
            height: `calc(100vh * ${FRAME_COUNT})`,
          }}
        >
          <div
            className={`absolute bg-gradient-to-b w-full h-full ${
              theme === Theme.DARK
                ? "from-black to-primary-650"
                : "from-white to-primary-450"
            }`}
          />

          <svg
            className="absolute h-full w-full"
            viewBox={`0 0 ${width} ${FRAME_COUNT * height}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>

            <rect
              opacity="0.08"
              width="100%"
              height="100%"
              filter="url(#noiseFilter)"
            />
          </svg>
        </div>

        {/* First frame */}
        <div className="animate-fade-in animate-ease-in-out flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <div className="my-2">
            <h1 className="mb-1 text-8xl">Beacon</h1>
            <h2 className="mt-1 text-xl">A location-based social network.</h2>
          </div>

          <IonButton
            className="my-2"
            color="primary"
            fill="outline"
            routerLink="/auth/step/1"
          >
            <IonIcon slot="start" ios={compassOutline} md={compassSharp} />
            Get Started
          </IonButton>
        </div>

        {/* Second frame */}
        <div className="flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <h2 className="mb-1 text-4xl">1. Create A Post</h2>
          <h3 className="mt-1 text-m">
            Every post can only be seen by other users nearby - you decide how
            close they need to be.
          </h3>
        </div>

        {/* Third frame */}
        <div className="flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <h2 className="mb-1 text-4xl">2. View Other Posts</h2>
          <h3 className="mt-1 text-m">
            View nearby posts and interact with them by commenting, upvoting,
            and downvoting them.
          </h3>
        </div>

        {/* Fourth frame */}
        <div className="flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <h2 className="mb-1 text-4xl">3. Remain Anonymous</h2>
          <h3 className="mt-1 text-m">
            You can choose to remain anonymous when creating posts and
            commenting on other posts.
          </h3>
        </div>

        {/* Fifth frame */}
        <div className="flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <div className="my-2">
            <h2 className="text-4xl">
              So what are you waiting for? Get started now!
            </h2>
          </div>

          <IonButton
            className="my-2"
            color="dark"
            fill="outline"
            routerLink="/auth/step/1"
          >
            <IonIcon slot="start" ios={compassOutline} md={compassSharp} />
            Get Started
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
