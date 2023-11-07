/**
 * @file App shell
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

import {
  IonAlert,
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  isPlatform,
  setupIonicReact,
} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import {useEffect} from "react";
import {Route, useHistory} from "react-router-dom";

import {AuthenticatedRoute} from "~/components/AuthenticatedRoute";
import {Menu} from "~/components/Menu";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {Theme} from "~/lib/types";
import {Auth} from "~/pages/Auth";
import {Error} from "~/pages/Error";
import {Index} from "~/pages/Index";
import {Nearby} from "~/pages/Nearby";
import {Settings} from "~/pages/Settings";

// Initialize Ionic
setupIonicReact({
  animated: true,
  mode: isPlatform("ios") ? "ios" : "md",
});

/**
 * App shell
 * @returns JSX
 */
export const App: React.FC = () => {
  // Hooks
  const error = useStore(state => state.error);
  const setError = useStore(state => state.setError);
  const setUser = useStore(state => state.setUser);
  const theme = useStore(state => state.theme);
  const history = useHistory();

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === Theme.DARK);
  }, [theme]);

  // Subscribe to auth changes
  client.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "INITIAL_SESSION":
      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
      case "USER_UPDATED":
        // Set the user
        setUser(session?.user);
        break;

      case "SIGNED_OUT": {
        // Set the error
        setError({
          name: "Signed out",
          description: "You have been signed out",
        });

        // Clear the user
        setUser();

        // Redirect to the auth page
        history.push("/auth");
      }
    }
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonAlert
          isOpen={error !== undefined}
          header={error?.name}
          subHeader={error?.description}
          buttons={["OK"]}
          onIonAlertDidDismiss={() => setError()}
        />

        <IonSplitPane contentId="main">
          <Menu />

          <IonRouterOutlet id="main">
            {/* Unauthenticated routes */}
            <Route path="/" exact={true}>
              <Index />
            </Route>

            <Route path="/auth" exact={true}>
              <Auth />
            </Route>

            {/* Authenticated routes */}
            <AuthenticatedRoute path="/nearby" exact={true}>
              <Nearby />
            </AuthenticatedRoute>

            <AuthenticatedRoute path="/settings" exact={true}>
              <Settings />
            </AuthenticatedRoute>

            {/* Catch-all route */}
            <Route>
              <Error
                name="404"
                description="The requested page was not found!"
                homeButton={true}
              />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};
