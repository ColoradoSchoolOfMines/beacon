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
import {useEffect, useRef} from "react";
import {Route} from "react-router-dom";

import {Step1} from "~/components/auth/Step1";
import {Step2A} from "~/components/auth/Step2A";
import {Step3A} from "~/components/auth/Step3A";
import {Step4A} from "~/components/auth/Step4A";
import {Menu} from "~/components/Menu";
import {RouteAuthGuard} from "~/components/RouteAuthGuard";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {RequiredAuthState, Theme} from "~/lib/types";
import {Error} from "~/pages/Error";
import {Home} from "~/pages/Home";
import {Nearby} from "~/pages/Nearby";
import {Settings} from "~/pages/Settings";

// Set the user
const session = await client.auth.getSession();
useStore.getState().setUser(session?.data?.session?.user);

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
  const router = useRef<IonReactRouter>(null);
  const error = useStore(state => state.error);
  const setError = useStore(state => state.setError);
  const setUser = useStore(state => state.setUser);
  const theme = useStore(state => state.theme);

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
        router.current?.history.push("/auth/step/1");
      }
    }
  });

  return (
    <IonApp>
      <IonReactRouter ref={router}>
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
            {/* Routes that are always available */}
            <Route path="/" exact={true}>
              <Home />
            </Route>

            {/* Unauthenticated routes */}

            <RouteAuthGuard
              requiredState={RequiredAuthState.UNAUTHENTICATED}
              redirectTo="/nearby"
              path="/auth/step/1"
              exact={true}
            >
              <Step1 />
            </RouteAuthGuard>

            <RouteAuthGuard
              requiredState={RequiredAuthState.UNAUTHENTICATED}
              redirectTo="/nearby"
              path="/auth/step/2a"
              exact={true}
            >
              <Step2A />
            </RouteAuthGuard>

            <RouteAuthGuard
              requiredState={RequiredAuthState.UNAUTHENTICATED}
              redirectTo="/nearby"
              path="/auth/step/3a"
              exact={true}
            >
              <Step3A />
            </RouteAuthGuard>

            {/* Authenticated routes */}
            <RouteAuthGuard
              requiredState={RequiredAuthState.AUTHENTICATED}
              path="/auth/step/4a"
              exact={true}
            >
              <Step4A />
            </RouteAuthGuard>

            <RouteAuthGuard
              requiredState={RequiredAuthState.AUTHENTICATED}
              path="/nearby"
              exact={true}
            >
              <Nearby />
            </RouteAuthGuard>

            <RouteAuthGuard
              requiredState={RequiredAuthState.AUTHENTICATED}
              path="/settings"
              exact={true}
            >
              <Settings />
            </RouteAuthGuard>

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
