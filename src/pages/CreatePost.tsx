/**
 * @file Create post page
 */

import {IonNav} from "@ionic/react";
import {createContext, useState} from "react";

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

  return (
    <CreatePostNavContext.Provider value={nav}>
      <IonNav ref={n => setNav(n ?? undefined)} root={() => <Step1 />} />
    </CreatePostNavContext.Provider>
  );
};
