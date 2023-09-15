/**
 * @file Vite config
 * @see https://vitejs.dev/config/
 */

import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {VitePWA} from "vite-plugin-pwa";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import {defineConfig} from "vite";
import Paths from "vite-tsconfig-paths";

// Get the root directory
const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    legacy(),
    Paths({
      projects: [join(root, "tsconfig.json")]
    }),
    UnoCSS(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "*.avif",
        "*.gif",
        "*.ico",
        "*.png",
        "*.svg",
        "*.tiff",
        "*.webp"
      ],
      manifest: {
        name: "Vega",
        // eslint-disable-next-line camelcase
        short_name: "Location-based social media",
        // eslint-disable-next-line camelcase
        theme_color: "#0000ff",
        // eslint-disable-next-line camelcase
        background_color: "#0000ff",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })

  ]
});
