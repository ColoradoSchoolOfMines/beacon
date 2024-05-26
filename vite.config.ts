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
import {ViteEjsPlugin} from "vite-plugin-ejs";
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
    build: {
      rollupOptions: {
        external: ["/runtime-vars.js"],
      },
      sourcemap: true,
    },
    define: {
      "import.meta.env.VERSION": JSON.stringify(version),
      "import.meta.env.GIT_BRANCH": JSON.stringify(branch),
      "import.meta.env.GIT_COMMIT": JSON.stringify(commit),
    },
    plugins: [
      ViteEjsPlugin(),
      React(),
      Paths({
        projects: [join(root, "tsconfig.json")],
      }),
      Svgr(),
      UnoCSS(),
      Legacy(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Beacon",
          short_name: "Beacon",
          description: "Location-based social media",
          start_url: "/nearby",
          theme_color: "#51c5db",
          background_color: "#0c1922",
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
