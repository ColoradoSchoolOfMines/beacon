/**
 * @file Header component
 */

import {IonMenuButton} from "@ionic/react";

/**
 * Header component
 * @returns JSX
 */
export const Header: React.FC = () => (
  <div className="absolute h-14 left-0 overflow-hidden top-0 w-14 z-10">
    <IonMenuButton />
  </div>
);
