/**
 * @file User utilities
 */

import {colord, extend} from "colord";
import namesPlugin from "colord/plugins/names.mjs";

// Extend colord
extend([namesPlugin]);

/**
 * Colord with name plugin
 */
interface ColordName extends ReturnType<typeof colord> {
  toName(options: {cloesest: boolean}): string | undefined;
}

/**
 * Generate a username from the user profile's color and emoji
 * @param color Profile color
 * @param emoji Profile emoji
 * @returns Username
 */
export const generateUsername = (color: string, emoji: string) => {
  // Get the name of the color
  const colorName = (colord(color) as ColordName).toName({
    cloesest: true,
  });

  const username = `${colorName} ${emoji}`;

  return username;
};
