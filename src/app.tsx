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
import {AuthState, GlobalMessageMetadata, Theme} from "~/lib/types";
import {getAuthState} from "~/lib/utils";
import {Step1 as AuthStep1} from "~/pages/auth/step1";
import {Step2 as AuthStep2} from "~/pages/auth/step2";
import {Step3 as AuthStep3} from "~/pages/auth/step3";
import {Error} from "~/pages/error";
import {Index} from "~/pages/index";
import {Nearby} from "~/pages/nearby";
import {Step1 as CreateCommentStep1} from "~/pages/posts/[id]/comments/create/step1";
import {PostIndex} from "~/pages/posts/[id]/index";
import {Step1 as CreatePostStep1} from "~/pages/posts/create/step1";
import {Step2 as CreatePostStep2} from "~/pages/posts/create/step2";
import {Privacy} from "~/pages/privacy";
import {Settings} from "~/pages/settings";
import {Terms} from "~/pages/terms";

/**
 * Signed out message metadata
 */
const SIGNED_OUT_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("app.signed-out"),
  name: "Signed out",
  description: "You have been signed out.",
};

/**
 * Route authentication state
 */
interface RouteAuthState {
  /**
   * Route path pattern
   */
  pathname: RegExp;

  /**
   * Required authentication state or undefined if the route is always available
   */
  requiredState: AuthState | undefined;
}

/**
 * Route authentication states
 */
const routeAuthStates: RouteAuthState[] = [
  {
    pathname: /^\/$/,
    requiredState: undefined,
  },
  {
    pathname: /^\/terms-and-conditions$/,
    requiredState: undefined,
  },
  {
    pathname: /^\/privacy-policy$/,
    requiredState: undefined,
  },
  {
    pathname: /^\/auth\/1$/,
    requiredState: AuthState.UNAUTHENTICATED,
  },
  {
    pathname: /^\/auth\/2$/,
    requiredState: AuthState.UNAUTHENTICATED,
  },
  {
    pathname: /^\/auth\/3$/,
    requiredState: AuthState.AUTHENTICATED_NO_TERMS,
  },
  {
    pathname: /^\/nearby$/,
    requiredState: AuthState.AUTHENTICATED_TERMS,
  },
  {
    pathname: /^\/posts\/create\/1$/,
    requiredState: AuthState.AUTHENTICATED_TERMS,
  },
  {
    pathname: /^\/posts\/create\/2$/,
    requiredState: AuthState.AUTHENTICATED_TERMS,
  },
  {
    pathname: /^\/posts\/[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/,
    requiredState: AuthState.AUTHENTICATED_TERMS,
  },
  {
    pathname: /^\/settings$/,
    requiredState: AuthState.AUTHENTICATED_TERMS,
  },
];

// // Set the user from the session (Block because this doesn't make a request to the backend)
// const session = await client.auth.getSession();
// useEphemeralUserStore.getState().setUser(session?.data?.session?.user);

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
  }
  // Otherwise the user is logged in
  else {
    useEphemeralUserStore.getState().setUser(data.user);
  }
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
  const guardRoute = (pathname: string, user?: User | null) => {
    // Require the user's state to be initialized (even if it's null)
    if (user === undefined) {
      return;
    }

    // Get the required authentication state
    const requiredState = routeAuthStates.find(({pathname: regex}) =>
      regex.test(pathname),
    )?.requiredState;

    if (requiredState === undefined) {
      return;
    }

    // Get the user's current authentication state
    const authState = getAuthState(user);

    // User needs to authenticate
    if (
      authState === AuthState.UNAUTHENTICATED &&
      [
        AuthState.AUTHENTICATED_NO_TERMS,
        AuthState.AUTHENTICATED_TERMS,
      ].includes(requiredState)
    ) {
      history.push("/auth/1");
      return;
    }

    // User needs to accept the terms and conditions
    if (
      authState === AuthState.AUTHENTICATED_NO_TERMS &&
      requiredState === AuthState.AUTHENTICATED_TERMS
    ) {
      history.push("/auth/3");
      return;
    }

    // User is already authenticated and has accepted the terms and conditions
    if (
      ([
        AuthState.AUTHENTICATED_NO_TERMS,
        AuthState.AUTHENTICATED_TERMS,
      ].includes(authState) &&
        requiredState === AuthState.UNAUTHENTICATED) ||
      (authState === AuthState.AUTHENTICATED_TERMS &&
        requiredState === AuthState.AUTHENTICATED_NO_TERMS)
    ) {
      history.push("/nearby");
      return;
    }
  };

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === Theme.DARK);
  }, [theme]);

  useEffect(() => guardRoute(location.pathname, user), [location, user]);

  // Subscribe to auth changes
  useEffect(() => {
    client.auth.onAuthStateChange(async (event, session) => {
      // eslint-disable-next-line unicorn/no-null
      let newUser = user ?? null;

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          // Set the user
          // eslint-disable-next-line unicorn/no-null
          newUser = session?.user ?? null;
          break;

        case "SIGNED_OUT": {
          // Display the message
          setMessage(SIGNED_OUT_MESSAGE_METADATA);

          // Clear the user
          // eslint-disable-next-line unicorn/no-null
          newUser = null;
        }
      }

      // Set the user
      if (user === undefined || !isEqual(user, newUser)) {
        setUser(newUser);
      }

      // Guard the route against the new authentication state
      guardRoute(location.pathname, newUser);
    });
  }, []);

  return (
    <>
      <IonSplitPane contentId="main">
        {location.pathname !== "/" && <Menu />}

        <IonRouterOutlet id="main">
          {/* Routes that are always available */}
          <Route path="/" exact={true}>
            <Index />
          </Route>

          <Route path="/terms-and-conditions" exact={true}>
            <Terms />
          </Route>

          <Route path="/privacy-policy" exact={true}>
            <Privacy />
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
            <PostIndex />
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
