/**
 * @file Profile avatar Component
 */

import {IonAvatar, IonIcon} from "@ionic/react";
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
 * @param props.profile Profile
 * @returns JSX
 */
export const Avatar: React.FC<AvatarProps> = ({profile}) => {
  return (
    <IonAvatar>
      <div
        className="flex flex-row h-full items-center justify-center rounded-full text-2xl w-full bg-neutral-200 dark:bg-neutral-700"
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
    </IonAvatar>
  );
};
