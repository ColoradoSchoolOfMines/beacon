/**
 * @file App shell
 */

// Setup geolocation
import "~/lib/geolocation";

import {IonRouterOutlet, IonSplitPane} from "@ionic/react";
import {User} from "@supabase/supabase-js";
import {isEqual} from "lodash-es";
import {ComponentProps, FC, useEffect} from "react";
import {Route, useHistory, useLocation} from "react-router-dom";

import {GlobalMessage} from "~/components/global-message";
import {Menu} from "~/components/menu";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {AuthState, GlobalMessageMetadata, Theme} from "~/lib/types";
import {getAuthState} from "~/lib/utils";
import {Step1 as AuthStep1} from "~/pages/auth/step1";
import {Step2 as AuthStep2} from "~/pages/auth/step2";
import {Step3 as AuthStep3} from "~/pages/auth/step3";
import {Error} from "~/pages/error";
import {Index} from "~/pages/index";
import {Markdown} from "~/pages/markdown";
import {Nearby} from "~/pages/nearby";
import {Step1 as CreateCommentStep1} from "~/pages/posts/[id]/comments/create/step1";
import {PostIndex} from "~/pages/posts/[id]/index";
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
 * Route metadata
 */
interface RouteMetadata<T extends FC> {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Regex route path
   */
  regexPath: RegExp;

  /**
   * React route path
   */
  routerPath?: string;

  /**
   * Whether the React route is exact
   */
  routerExact?: boolean;

  /**
   * Required authentication state or undefined if the route is always available
   */
  requiredState?: AuthState;

  /**
   * Route component
   */
  component: T;

  /**
   * React component props
   */
  componentProps?: ComponentProps<T>;
}

/**
 * Route metadata
 */
const routeMetadata: RouteMetadata<any>[] = [
  {
    id: "index",
    regexPath: /^\/$/,
    routerPath: "/",
    routerExact: true,
    component: Index,
  },
  {
    id: "faq",
    regexPath: /^\/faq$/,
    routerPath: "/faq",
    routerExact: true,
    component: Markdown,
    componentProps: {
      title: "Frequently Asked Questions",
      url: "/custom/faq.md",
    },
  },
  {
    id: "terms-and-conditions",
    regexPath: /^\/terms-and-conditions$/,
    routerPath: "/terms-and-conditions",
    routerExact: true,
    component: Markdown,
    componentProps: {
      title: "Terms and Conditions",
      url: "/custom/terms-and-conditions.md",
    },
  },
  {
    id: "privacy-policy",
    regexPath: /^\/privacy-policy$/,
    routerPath: "/privacy-policy",
    routerExact: true,
    component: Markdown,
    componentProps: {
      title: "Privacy Policy",
      url: "/custom/privacy-policy.md",
    },
  },
  {
    id: "auth-step-1",
    regexPath: /^\/auth\/1$/,
    routerPath: "/auth/1",
    routerExact: true,
    requiredState: AuthState.UNAUTHENTICATED,
    component: AuthStep1,
  },
  {
    id: "auth-step-2",
    regexPath: /^\/auth\/2$/,
    routerPath: "/auth/2",
    routerExact: true,
    requiredState: AuthState.UNAUTHENTICATED,
    component: AuthStep2,
  },
  {
    id: "auth-step-3",
    regexPath: /^\/auth\/3$/,
    routerPath: "/auth/3",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_NO_TERMS,
    component: AuthStep3,
  },
  {
    id: "nearby",
    regexPath: /^\/nearby$/,
    routerPath: "/nearby",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: Nearby,
  },
  {
    id: "posts-create-1",
    regexPath: /^\/posts\/create\/1$/,
    routerPath: "/posts/create/1",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: CreatePostStep1,
  },
  {
    id: "posts-create-2",
    regexPath: /^\/posts\/create\/2$/,
    routerPath: "/posts/create/2",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: CreatePostStep2,
  },
  {
    id: "posts-comments-create-1",
    regexPath:
      /^\/posts\/[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}\/comments\/create\/1$/,
    routerPath: "/posts/:id/comments/create/1",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: CreateCommentStep1,
  },
  {
    id: "posts-index",
    regexPath: /^\/posts\/[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/,
    routerPath: "/posts/:id",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: PostIndex,
  },
  {
    id: "settings",
    regexPath: /^\/settings$/,
    routerPath: "/settings",
    routerExact: true,
    requiredState: AuthState.AUTHENTICATED_TERMS,
    component: Settings,
  },
  {
    id: "error",
    regexPath: /^.*$/,
    component: Error,
    componentProps: {
      name: "404",
      description: "The requested page was not found!",
      homeButton: true,
    },
  },
];

// Set the user from the backend (Don't block because this makes a request to the backend)
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  // If there is no user, return
  if (useEphemeralStore.getState().user === undefined) {
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
    useEphemeralStore.getState().setUser(data.user);
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

  const setMessage = useEphemeralStore(state => state.setMessage);
  const user = useEphemeralStore(state => state.user);
  const setUser = useEphemeralStore(state => state.setUser);
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
    const requiredState = routeMetadata.find(({regexPath: regex}) =>
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
          {routeMetadata.map(
            ({
              id,
              routerPath,
              routerExact,
              component: Component,
              componentProps,
            }) => (
              <Route key={id} path={routerPath} exact={routerExact}>
                <Component {...componentProps} />
              </Route>
            ),
          )}
        </IonRouterOutlet>
      </IonSplitPane>

      <GlobalMessage />
    </>
  );
};
