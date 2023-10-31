/**
 * @file Vite config
 * @see https://vitejs.dev/config/
 */

import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import Legacy from "@vitejs/plugin-legacy";
import React from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import {defineConfig} from "vite";
import {VitePWA} from "vite-plugin-pwa";
import Svgr from "vite-plugin-svgr";
import Paths from "vite-tsconfig-paths";

// Get the root directory
const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    Svgr(),
    React(),
    Legacy(),
    Paths({
      projects: [join(root, "tsconfig.json")],
    }),
    UnoCSS(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Beacon",
        // eslint-disable-next-line camelcase
        short_name: "Location-based social media",
        // eslint-disable-next-line camelcase
        theme_color: "#206eeb",
        // eslint-disable-next-line camelcase
        background_color: "#2dc4ff",
        icons: [
          {
            src: "/logo-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/logo-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
