/**
 * @file App shell
 */

import {IonAlert, IonRouterOutlet, IonSplitPane} from "@ionic/react";
import {User} from "@supabase/supabase-js";
import {isEqual} from "lodash-es";
import {useEffect} from "react";
import {Route, useHistory, useLocation} from "react-router-dom";

import {Menu} from "~/components/Menu";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {RequiredAuthState, Theme} from "~/lib/types";
import {checkRequiredAuthState} from "~/lib/utils";
import {Auth} from "~/pages/Auth";
import {CreatePost} from "~/pages/CreatePost";
import {Error} from "~/pages/Error";
import {Home} from "~/pages/Home";
import {Nearby} from "~/pages/Nearby";
import {Settings} from "~/pages/Settings";

/**
 * Route authentication states
 */
const routeAuthStates: Record<string, RequiredAuthState> = {
  "/": RequiredAuthState.ANY,
  "/auth": RequiredAuthState.UNAUTHENTICATED,
  "/nearby": RequiredAuthState.AUTHENTICATED,
  "/posts/create": RequiredAuthState.AUTHENTICATED,
  "/settings": RequiredAuthState.AUTHENTICATED,
};

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
      // Go to the required route
      switch (requiredState) {
        case RequiredAuthState.UNAUTHENTICATED:
          history.push("/nearby");
          break;

        case RequiredAuthState.AUTHENTICATED:
          history.push("/auth");
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
            description: "You have been signed out.",
          });

          // Clear the user
          newUser = undefined;
        }
      }

      // Set the user
      if (!isEqual(user, newUser)) {
        setUser(newUser);
      }

      // Guard the route against the new authentication state
      guardRoute(location.pathname, newUser);
    });
  }, []);

  return (
    <>
      <IonSplitPane contentId="main">
        <Menu />

        <IonRouterOutlet id="main">
          {/* Routes that are always available */}
          <Route path="/" exact={true}>
            <Home />
          </Route>

          {/* Unauthenticated routes */}
          <Route path="/auth" exact={true}>
            <Auth />
          </Route>

          {/* Authenticated routes */}
          <Route path="/nearby" exact={true}>
            <Nearby />
          </Route>

          <Route path="/posts/create" exact={true}>
            <CreatePost />
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

      <IonAlert
        isOpen={message !== undefined}
        header={message?.name}
        subHeader={message?.description}
        buttons={["OK"]}
        onIonAlertDidDismiss={() => setMessage()}
      />
    </>
  );
};
