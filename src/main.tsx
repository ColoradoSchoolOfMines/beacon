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
import React from "react";
import {createRoot} from "react-dom/client";

import {App} from "~/App";

// Setup React
const container = document.getElementById("root");
const root = createRoot(container!);

// Setup Ionic
setupIonicReact({
  animated: true,
  mode: isPlatform("ios") ? "ios" : "md",
});

root.render(
  <React.StrictMode>
    <IonApp>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </IonApp>
  </React.StrictMode>,
);
