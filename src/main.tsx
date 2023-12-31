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
import "~/styles/theme.css";

import {IonApp, isPlatform, setupIonicReact} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import React from "react";
import {createRoot} from "react-dom/client";

import {App} from "~/App";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";

/* ---------------------------------------- Setup React ---------------------------------------- */
const container = document.getElementById("root");
const root = createRoot(container!);

/* --------------------------------------- Setup Supabase -------------------------------------- */

// Set the user from the session (Block because this doesn't make a request to the backend)
const session = await client.auth.getSession();
useStore.getState().setUser(session?.data?.session?.user);

// Set the user from the backend (Don't block because this makes a request to the backend)
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  // If there is no user, return
  if (useStore.getState().user === undefined) {
    return;
  }

  // Get the user
  const {data, error} = await client.auth.getUser();

  // If the backend returns an error or the user is null, sign out
  if (data.user === null || error !== null) {
    await client.auth.signOut();
    return;
  }

  // Set the user
  useStore.getState().setUser(data.user);
})();

/* ---------------------------------------- Setup Ionic ---------------------------------------- */
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
