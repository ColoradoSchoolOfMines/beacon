/**
 * @file Auth page
 */

import {IonNav} from "@ionic/react";
import {createContext, useEffect, useState} from "react";

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
    <AuthNavContext.Provider value={nav}>
      <IonNav ref={n => setNav(n ?? undefined)} />
    </AuthNavContext.Provider>
  );
};
