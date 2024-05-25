/**
 * @file Index page
 */

import {IonButton, IonContent, IonIcon, IonPage} from "@ionic/react";
import {
  documentTextOutline,
  documentTextSharp,
  navigateCircleOutline,
  navigateCircleSharp,
  shieldOutline,
  shieldSharp,
} from "ionicons/icons";
import {FC, useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";
import {useMeasure} from "react-use";

import {Header} from "~/components/header";
import {usePersistentStore} from "~/lib/stores/persistent";
import {Theme} from "~/lib/types";
import styles from "~/pages/index.module.css";

/**
 * Number of frames
 */
const FRAME_COUNT = 6;

/**
 * Index page
 * @returns JSX
 */
export const Index: FC = () => {
  // Hooks
  const theme = usePersistentStore(state => state.theme);
  const [containerRef, {height, width}] = useMeasure();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const location = useLocation();

  // Effects
  useEffect(() => {
    setTimeout(async () => {
      if (contentRef.current === null) {
        return;
      }

      // Scroll back to the top
      await contentRef.current.scrollToTop(0);
    }, 50);
  }, [location.pathname]);

  return (
    <IonPage ref={containerRef}>
      <Header />

      <IonContent
        className={styles.snapContent}
        style={{
          "--window-height": `${height}px`,
        }}
        ref={contentRef}
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
                ? "from-black to-primary-500"
                : "from-white to-primary-600"
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
                baseFrequency="10"
                numOctaves="1"
                stitchTiles="stitch"
              />
            </filter>

            <rect
              opacity={theme === Theme.DARK ? "0.2" : "0.4"}
              width="100%"
              height="100%"
              filter="url(#noiseFilter)"
            />
          </svg>
        </div>

        {/* First frame */}
        <div className="animate-fade-in animate-ease-in-out flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <div className="my-2">
            <h1 className="mb-1 text-7xl font-bold tracking-[0.2em]">BEACON</h1>
            <h2 className="mt-1 text-xl">A location-based social network.</h2>
          </div>

          <IonButton
            className="my-2"
            color="primary"
            fill="outline"
            routerLink="/auth/1"
          >
            <IonIcon
              slot="start"
              ios={navigateCircleOutline}
              md={navigateCircleSharp}
            />
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
            routerLink="/auth/1"
          >
            <IonIcon
              slot="start"
              ios={navigateCircleOutline}
              md={navigateCircleSharp}
            />
            Get Started
          </IonButton>
        </div>

        {/* Sixth frame */}
        <div className="flex flex-col h-[var(--window-height)] items-center justify-center px-6 text-center w-full snap-center">
          <div className="my-2">
            <h2 className="text-4xl">Legal Stuff</h2>
          </div>

          <IonButton
            className="my-2"
            color="dark"
            fill="outline"
            href="/terms-and-conditions"
          >
            <IonIcon
              slot="start"
              ios={documentTextOutline}
              md={documentTextSharp}
            />
            Terms and Conditions
          </IonButton>

          <IonButton
            className="my-2"
            color="dark"
            fill="outline"
            href="/privacy-policy"
          >
            <IonIcon slot="start" ios={shieldOutline} md={shieldSharp} />
            Privacy Policy
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
