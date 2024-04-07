/**
 * @file App shell
 */

import {IonRouterOutlet, IonSplitPane} from "@ionic/react";
import {User} from "@supabase/supabase-js";
import {isEqual} from "lodash-es";
import {FC, useEffect} from "react";
import {Route, useHistory, useLocation} from "react-router-dom";

import {GlobalMessage} from "~/components/global-message";
import {Menu} from "~/components/menu";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {useEphemeralUserStore} from "~/lib/stores/ephemeral-user";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {GlobalMessageMetadata, RequiredAuthState, Theme} from "~/lib/types";
import {checkRequiredAuthState} from "~/lib/utils";
import {Step1 as AuthStep1} from "~/pages/auth/step1";
import {Step2 as AuthStep2} from "~/pages/auth/step2";
import {Step3 as AuthStep3} from "~/pages/auth/step3";
import {Error} from "~/pages/error";
import {Home} from "~/pages/home";
import {Nearby} from "~/pages/nearby";
import {Step1 as CreateCommentStep1} from "~/pages/posts/[id]/comments/create/step1";
import {Post} from "~/pages/posts/[id]/post";
import {Step1 as CreatePostStep1} from "~/pages/posts/create/step1";
import {Step2 as CreatePostStep2} from "~/pages/posts/create/step2";
import {Settings} from "~/pages/settings";

/**
 * Signed out message metadata
 */
const SIGNED_OUT_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("app.signed-out"),
  name: "Signed out",
  description: "You have been signed out.",
};

/**
 * Route authentication states
 */
const routeAuthStates = [
  {
    pathname: /^\/$/,
    requiredState: RequiredAuthState.ANY,
  },
  {
    pathname: /^\/auth\/1$/,
    requiredState: RequiredAuthState.UNAUTHENTICATED,
  },
  {
    pathname: /^\/auth\/2$/,
    requiredState: RequiredAuthState.UNAUTHENTICATED,
  },
  {
    pathname: /^\/auth\/3$/,
    requiredState: RequiredAuthState.UNAUTHENTICATED,
  },
  {
    pathname: /^\/nearby$/,
    requiredState: RequiredAuthState.AUTHENTICATED,
  },
  {
    pathname: /^\/posts\/create\/1$/,
    requiredState: RequiredAuthState.AUTHENTICATED,
  },
  {
    pathname: /^\/posts\/create\/2$/,
    requiredState: RequiredAuthState.AUTHENTICATED,
  },
  {
    pathname: /^\/posts\/[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/,
    requiredState: RequiredAuthState.AUTHENTICATED,
  },
  {
    pathname: /^\/settings$/,
    requiredState: RequiredAuthState.AUTHENTICATED,
  },
] as {
  pathname: RegExp;
  requiredState: RequiredAuthState;
}[];

// Set the user from the session (Block because this doesn't make a request to the backend)
const session = await client.auth.getSession();
useEphemeralUserStore.getState().setUser(session?.data?.session?.user);

// Set the user from the backend (Don't block because this makes a request to the backend)
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  // If there is no user, return
  if (useEphemeralUserStore.getState().user === undefined) {
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
  useEphemeralUserStore.getState().setUser(data.user);
})();

/**
 * App shell
 * @returns JSX
 */
export const App: FC = () => {
  // Hooks
  const history = useHistory();
  const location = useLocation();

  const setMessage = useEphemeralUIStore(state => state.setMessage);
  const user = useEphemeralUserStore(state => state.user);
  const setUser = useEphemeralUserStore(state => state.setUser);
  const theme = usePersistentStore(state => state.theme);

  // Methods
  /**
   * Guard the current route
   * @param pathname Current route pathname
   * @param user Current user
   */
  const guardRoute = (pathname: string, user: User | undefined) => {
    // Get the required authentication state
    const requiredState = routeAuthStates.find(({pathname: regex}) =>
      regex.test(pathname),
    )?.requiredState;

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
          history.push("/auth/1");
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
          setMessage(SIGNED_OUT_MESSAGE_METADATA);

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
          <Route path="/auth/1" exact={true}>
            <AuthStep1 />
          </Route>

          <Route path="/auth/2" exact={true}>
            <AuthStep2 />
          </Route>

          <Route path="/auth/3" exact={true}>
            <AuthStep3 />
          </Route>

          {/* Authenticated routes */}
          <Route path="/nearby" exact={true}>
            <Nearby />
          </Route>

          <Route path="/posts/create/1" exact={true}>
            <CreatePostStep1 />
          </Route>

          <Route path="/posts/create/2" exact={true}>
            <CreatePostStep2 />
          </Route>

          <Route path="/posts/:id/comments/create/1" exact={true}>
            <CreateCommentStep1 />
          </Route>

          <Route path="/posts/:id" exact={true}>
            <Post />
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

      <GlobalMessage />
    </>
  );
};
