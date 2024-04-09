/**
 * @file UnoCSS config
 * @see https://unocss.dev/guide/config-file
 */

import presetWind from "@unocss/preset-wind";
import transformDirectives from "@unocss/transformer-directives";
import {Colord, extend} from "colord";
import mixPlugin from "colord/plugins/mix";
import {defineConfig} from "unocss";

// Extend Colord
extend([mixPlugin]);

/**
 * Primary color
 */
const primary = new Colord("#51c5db");

/**
 * Secondary color
 */
const secondary = new Colord("#f69876");

/**
 * Generate tones of a color
 * @param color Color to generate tones for
 * @returns Tones
 */
const generateTones = (color: Colord) =>
  Object.fromEntries(
    [
      ...color.tints(22).reverse(),
      ...color.shades(22).slice(1),
    ]
      .map((tone, index) => [25 * index, tone.toHex()])
      .filter((_, index) => index === 1 || index % 2 === 0)
      .slice(1, -1),
  );

export default defineConfig({
  presets: [
    presetWind({
      dark: "class",
    }),
  ],
  transformers: [transformDirectives()],
  theme: {
    colors: {
      primary: generateTones(primary),
      secondary: generateTones(secondary),
    },
  },
});
