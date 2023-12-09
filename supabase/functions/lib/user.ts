/**
 * @file User utilities
 */

//@deno-types="npm:colord@^2.9.3"
import {Colord, extend} from "colord";
import labPlugin from "colord/plugins/lab";
import rawColorNames from "color-name-list";

// Extend Colord
// @ts-expect-error Plugin types are broken in Deno
extend([labPlugin]);

/**
 * Colors
 */
const colors = Object.fromEntries(
  rawColorNames.colorNameList.map((color: {name: string; hex: string}) => [
    color.name,
    new Colord(color.hex),
  ]),
) as Record<string, Colord>;

/**
 * Generate a username from the user profile's color and emoji
 * @param rawColor Raw profile color
 * @param emoji Profile emoji
 * @returns Username
 */
export const generateUsername = (rawColor: string, emoji: string) => {
  // Find the nearest color
  const color = new Colord(rawColor);
  let closestName: string | undefined;
  let closestDistance = Infinity;

  for (const [name, namedColor] of Object.entries(colors)) {
    //@ts-expect-error Lab plugin types don't work in Deno
    const distance = color.delta(namedColor);

    if (distance < closestDistance) {
      closestName = name;
      closestDistance = distance;
    }
  }

  return `${closestName ?? "Mystery"} ${emoji}`;
};
