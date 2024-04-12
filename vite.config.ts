/**
 * @file Vite config
 * @see https://vitejs.dev/config/
 */
/* eslint-disable camelcase */

import {readFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import Legacy from "@vitejs/plugin-legacy";
import React from "@vitejs/plugin-react";
import {execa} from "execa";
import UnoCSS from "unocss/vite";
import {defineConfig} from "vite";
import {VitePWA} from "vite-plugin-pwa";
import Svgr from "vite-plugin-svgr";
import TopLevelAwait from "vite-plugin-top-level-await";
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

  // Read the terms and conditions text
  const termsAndConditionsText = await readFile(
    join(
      root,
      process.env.VITE_TERMS_AND_CONDITIONS ??
        "src/assets/terms-and-conditions.md",
    ),
    "utf8",
  );

  // Read the privacy policy text
  const privacyPolicyText = await readFile(
    join(
      root,
      process.env.VITE_PRIVACY_POLICY ?? "src/assets/privacy-policy.md",
    ),
    "utf8",
  );

  return {
    define: {
      "import.meta.env.VERSION": JSON.stringify(version),
      "import.meta.env.GIT_BRANCH": JSON.stringify(branch),
      "import.meta.env.GIT_COMMIT": JSON.stringify(commit),
      "import.meta.env.VITE_TERMS_AND_CONDITIONS": JSON.stringify(
        termsAndConditionsText,
      ),
      "import.meta.env.VITE_PRIVACY_POLICY": JSON.stringify(privacyPolicyText),
    },
    plugins: [
      TopLevelAwait(),
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
