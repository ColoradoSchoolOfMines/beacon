/**
 * @file App entrypoint
 */

// Styles
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "~/theme.css";
// Setup geolocation
import "~/lib/geolocation";

import {IonApp, isPlatform, setupIonicReact} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import {
  browserTracingIntegration,
  init as sentryInit,
  setTags,
} from "@sentry/browser";
import {SupabaseIntegration} from "@supabase/sentry-js-integration";
import {SupabaseClient} from "@supabase/supabase-js";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {App} from "~/app";
import {
  GIT_BRANCH,
  GIT_COMMIT,
  SENTRY_DSN,
  SUPABASE_URL,
  VERSION,
} from "~/lib/vars";

// Setup Sentry
if (SENTRY_DSN !== undefined) {
  sentryInit({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1,
    integrations: [
      new SupabaseIntegration(SupabaseClient, {
        tracing: true,
        breadcrumbs: true,
        errors: true,
      }),
      browserTracingIntegration({
        /**
         * Callback to determine if a request should create a span
         * @param url Request URL
         * @returns Whether a span should be created
         */
        shouldCreateSpanForRequest: url =>
          !url.startsWith(`${SUPABASE_URL}/rest`),
      }),
    ],
  });

  setTags({
    GIT_BRANCH,
    GIT_COMMIT,
    VERSION,
  });
}

// Setup React
const container = document.getElementById("root");
const root = createRoot(container!);

// Setup Ionic
setupIonicReact({
  animated: true,
  mode: isPlatform("ios") ? "ios" : "md",
});

root.render(
  <StrictMode>
    <IonApp>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </IonApp>
  </StrictMode>,
);
