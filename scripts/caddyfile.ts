/**
 * @file Generate the Caddyfile
 */

import "dotenv/config";

import {writeFile} from "node:fs/promises";
import {join} from "node:path";

import {cspHashes} from "@vitejs/plugin-legacy";
import {uniq} from "lodash-es";

import {root} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  // Get the Supabase sources
  const supabaseSources = uniq([
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_FUNCTIONS_URL,
  ]).filter(origin => origin?.trim() !== "");

  if (supabaseSources.length === 0) {
    throw new Error("No Supabase sources found");
  }

  // Generate additional script-src sources
  const additionalScriptSources = cspHashes.map(hash => `'sha256-${hash}'`);

  // Render the Caddyfile
  const caddyfile = `# This file is automatically generated by npm run caddyfile:generate. DO NOT EDIT THIS FILE!
{
  admin off
  auto_https off
  persist_config off
  log default {
    output stderr
    format console
  }
  grace_period 10s
  shutdown_delay 30s
}

# Main server
:8080 {
  header {
    # https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html

    # Remove headers which leak server information
    -Server
    -X-Powered-By

    # Add security headers
    X-Frame-Options "DENY"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Strict-Transport-Security "max-age=63072000; includeSubDomains"
    Cross-Origin-Opener-Policy "same-origin"
    Cross-Origin-Resource-Policy "same-site"
    Content-Security-Policy "default-src 'self'; connect-src 'self' ${supabaseSources.join(" ")} https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' data:; frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com; img-src 'self' ${supabaseSources.join(" ")}; script-src 'self' ${additionalScriptSources.join(" ")} https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com;"
    Permissions-Policy "accelerometer=(), ambient-light-sensor=(), autoplay=self, battery=(), bluetooth=(), browsing-topics=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gamepad=(), geolocation=self, gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), local-fonts=(), magnetometer=(), microphone=(), midi=(), otp-credentials=(), payment=(), picture-in-picture=(), publickey-credentials-create=self, publickey-credentials-get=self, screen-wake-lock=(), serial=(), speaker-selection=(), storage-access=(), usb=(), web-shared=(), window-management=(), xr-spatial-tracking=(), interest-cohort=()"
  }

  # Single Page Application (https://caddyserver.com/docs/caddyfile/patterns#single-page-apps-spas)
  handle {
    root * dist
    encode gzip
    try_files {path} /index.html
    file_server
  }
}

# Health check
:8081 {
  # See https://caddyserver.com/docs/caddyfile/options#shutdown-delay
  handle {
    @goingDown vars {http.shutting_down} true
    respond @goingDown "Going down in {http.time_until_shutdown}" 503
    respond "OK" 200
  }
}
`;

  // Generate the Caddyfile path
  const caddyfilePath = join(root, "deployment", "Caddyfile");

  // Save the Caddyfile
  await writeFile(caddyfilePath, caddyfile);

  // Log
  console.log(`Caddyfile generated at ${caddyfilePath}`);
};

main();
