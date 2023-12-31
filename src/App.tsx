/**
 * @file App shell
 */

import {IonAlert, IonRouterOutlet, IonSplitPane} from "@ionic/react";
import {User} from "@supabase/supabase-js";
import {useEffect} from "react";
import {Route, useHistory, useLocation} from "react-router-dom";

import {Step1} from "~/components/auth/Step1";
import {Step2A} from "~/components/auth/Step2A";
import {Step3A} from "~/components/auth/Step3A";
import {Step4A} from "~/components/auth/Step4A";
import {Menu} from "~/components/Menu";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {RequiredAuthState, Theme} from "~/lib/types";
import {checkRequiredAuthState} from "~/lib/utils";
import {Error} from "~/pages/Error";
import {Home} from "~/pages/Home";
import {Nearby} from "~/pages/Nearby";
import {Settings} from "~/pages/Settings";

/**
 * Route authentication states
 */
const routeAuthStates: Record<string, RequiredAuthState> = {
  "/": RequiredAuthState.ANY,
  "/auth/step/1": RequiredAuthState.UNAUTHENTICATED,
  "/auth/step/2a": RequiredAuthState.UNAUTHENTICATED,
  "/auth/step/3a": RequiredAuthState.UNAUTHENTICATED,
  "/auth/step/4a": RequiredAuthState.AUTHENTICATED,
  "/nearby": RequiredAuthState.AUTHENTICATED,
  "/settings": RequiredAuthState.AUTHENTICATED,
};

/**
 * App shell
 * @returns JSX
 */
export const App: React.FC = () => {
  // Hooks
  const history = useHistory();
  const location = useLocation();

  const message = useStore(state => state.message);
  const setMessage = useStore(state => state.setMessage);
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const theme = useStore(state => state.theme);

  // Methods
  /**
   * Guard the current route
   * @param pathname Current route pathname
   * @param user Current user
   */
  const guardRoute = (pathname: string, user: User | undefined) => {
    // Get the required authentication state
    const requiredState = routeAuthStates[pathname];

    // Check the required authentication state
    if (
      requiredState !== undefined &&
      !checkRequiredAuthState(user, requiredState)
    ) {
      // Redirect
      switch (requiredState) {
        case RequiredAuthState.UNAUTHENTICATED:
          history.push("/nearby");
          break;

        case RequiredAuthState.AUTHENTICATED:
          history.push("/auth/step/1");
          break;
      }
    }
  };

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === Theme.DARK);
  }, [theme]);

  useEffect(() => guardRoute(location.pathname, user), [location, user]);

  // Subscribe to auth changes
  useEffect(() => {
    client.auth.onAuthStateChange((event, session) => {
      let newUser = user;

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          // Set the user
          newUser = session?.user;
          break;

        case "SIGNED_OUT": {
          // Display the message
          setMessage({
            name: "Signed out",
            description: "You have been signed out",
          });

          // Clear the user
          newUser = undefined;
        }
      }

      // Set the user
      if (newUser !== user) {
        setUser(newUser);
      }

      // Guard the route against the new authentication state
      guardRoute(location.pathname, newUser);
    });
  }, []);

  return (
    <>
      <IonAlert
        isOpen={message !== undefined}
        header={message?.name}
        subHeader={message?.description}
        buttons={["OK"]}
        onIonAlertDidDismiss={() => setMessage()}
      />

      <IonSplitPane contentId="main">
        <Menu />

        <IonRouterOutlet id="main">
          {/* Routes that are always available */}
          <Route path="/" exact={true}>
            <Home />
          </Route>

          {/* Unauthenticated routes */}
          <Route path="/auth/step/1" exact={true}>
            <Step1 />
          </Route>

          <Route path="/auth/step/2a" exact={true}>
            <Step2A />
          </Route>

          <Route path="/auth/step/3a" exact={true}>
            <Step3A />
          </Route>

          {/* Authenticated routes */}
          <Route path="/auth/step/4a" exact={true}>
            <Step4A />
          </Route>

          <Route path="/nearby" exact={true}>
            <Nearby />
          </Route>

          <Route path="/settings" exact={true}>
            <Settings />
          </Route>

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
    </>
  );
};
