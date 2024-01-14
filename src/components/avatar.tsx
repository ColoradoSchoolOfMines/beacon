/**
 * @file Profile avatar Component
 */

import {IonIcon} from "@ionic/react";
import {helpOutline, helpSharp} from "ionicons/icons";
import {FC} from "react";

import {useSettingsStore} from "~/lib/stores/settings";
import {Profile, Theme} from "~/lib/types";

/**
 * Profile avatar component props
 */
interface AvatarProps {
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
export const Avatar: FC<AvatarProps> = ({profile}) => {
  // Hooks
  const theme = useSettingsStore(state => state.theme);

  // Variables
  let color = profile.color;

  if (color === undefined) {
    color = theme === Theme.DARK ? "#404040" : "#e5e5e5";
  }

  return (
    <div
      className="flex flex-row h-9 items-center justify-center rounded-full w-9"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 20px -2px ${color}`,
      }}
    >
      {profile.emoji === undefined ? (
        <IonIcon className="!text-lg" ios={helpOutline} md={helpSharp} />
      ) : (
        <p className="!text-lg">{profile.emoji}</p>
      )}
    </div>
  );
};
