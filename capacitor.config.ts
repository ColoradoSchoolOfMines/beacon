/**
 * @file Capacitor config
 * @see https://capacitorjs.com/docs/config
 */

import {CapacitorConfig} from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "yikyak-clone",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
