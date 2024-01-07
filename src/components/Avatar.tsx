/**
 * @file Profile avatar Component
 */

import {IonIcon} from "@ionic/react";
import {helpOutline, helpSharp} from "ionicons/icons";

import {Profile} from "~/lib/types";

/**
 * Profile avatar component props
 */
export interface AvatarProps {
  /**
   * Profile
   */
  profile: Partial<Pick<Profile, "color" | "emoji">>;
}

/**
 * Profile avatar component
 * @param props Props
 * @returns JSX
 */
export const Avatar: React.FC<AvatarProps> = ({profile}) => {
  return (
    <div
      className="flex flex-row h-12 items-center justify-center rounded-full text-2xl w-12 bg-neutral-200 dark:bg-neutral-700"
      style={{
        backgroundColor: profile.color,
      }}
    >
      {profile.emoji === undefined ? (
        <IonIcon ios={helpOutline} md={helpSharp} />
      ) : (
        <p>{profile.emoji}</p>
      )}
    </div>
  );
};
