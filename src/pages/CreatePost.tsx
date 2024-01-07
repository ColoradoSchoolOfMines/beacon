/**
 * @file Create post page
 */

import {IonNav} from "@ionic/react";
import {createContext, useEffect, useState} from "react";

import {Step1} from "~/components/create-post/Step1";

/**
 * Create post page nav context
 */
export const CreatePostNavContext = createContext<
  HTMLIonNavElement | undefined
>(undefined);

/**
 * Create post page
 * @returns JSX
 */
export const CreatePost: React.FC = () => {
  // Hooks
  const [nav, setNav] = useState<HTMLIonNavElement | undefined>(undefined);

  // Effects
  useEffect(() => {
    (async () => {
      if (nav === undefined) {
        return;
      }

      // Set the root only once (otherwise the nav will be reset anytime this or any parent component re-renders)
      await nav.setRoot(() => <Step1 />);
    })();
  }, [nav]);

  return (
    <CreatePostNavContext.Provider value={nav}>
      <IonNav ref={n => setNav(n ?? undefined)} />
    </CreatePostNavContext.Provider>
  );
};
