/**
 * @file Auth page
 */

import {IonNav} from "@ionic/react";
import {createContext, useState} from "react";

import {Step1} from "~/components/auth/Step1";

/**
 * Auth page nav context
 */
export const AuthNavContext = createContext<HTMLIonNavElement | undefined>(
  undefined,
);

/**
 * Auth page
 * @returns JSX
 */
export const Auth: React.FC = () => {
  // Hooks
  const [nav, setNav] = useState<HTMLIonNavElement | undefined>(undefined);

  return (
    <AuthNavContext.Provider value={nav}>
      <IonNav ref={n => setNav(n ?? undefined)} root={() => <Step1 />} />
    </AuthNavContext.Provider>
  );
};
