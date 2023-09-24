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
const primary = new Colord("#0000ff");

// Generate primary tints and shades
const primaryTones = Object.fromEntries(
  [...primary.tints(11).reverse(), ...primary.shades(11).slice(1)]
    .map((color, index) => [50 * index, color.toHex()])
    .filter((_, index) => index === 1 || index % 2 === 0)
    .slice(1, -1)
);

export default defineConfig({
  presets: [
    presetWind({
      dark: "media",
    }),
  ],
  transformers: [transformDirectives()],
  theme: {
    colors: {
      primary: primaryTones,
    },
  },
});
