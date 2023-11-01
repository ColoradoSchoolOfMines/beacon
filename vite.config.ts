/**
 * @file Vite config
 * @see https://vitejs.dev/config/
 */
/* eslint-disable camelcase */

import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import Legacy from "@vitejs/plugin-legacy";
import React from "@vitejs/plugin-react";
import {execa} from "execa";
import UnoCSS from "unocss/vite";
import {defineConfig} from "vite";
import {VitePWA} from "vite-plugin-pwa";
import Svgr from "vite-plugin-svgr";
import Paths from "vite-tsconfig-paths";

import {version} from "./package.json";

// Get the root directory
const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  // Get git information
  const {stdout: branch} = await execa("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);

  const {stdout: commit} = await execa("git", [
    "rev-parse",
    "--short",
    "HEAD",
  ]);

  return {
    define: {
      "import.meta.env.VERSION": JSON.stringify(version),
      "import.meta.env.GIT_BRANCH": JSON.stringify(branch),
      "import.meta.env.GIT_COMMIT": JSON.stringify(commit),
    },
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
          short_name: "Location-based social media",
          theme_color: "#206eeb",
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
  };
});
