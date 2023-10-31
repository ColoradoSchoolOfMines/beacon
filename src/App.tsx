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
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import {useEffect} from "react";
import {Route} from "react-router-dom";

import {Menu} from "~/components/Menu";
import {useStore} from "~/lib/state";
import {Error} from "~/pages/Error";
import {Home} from "~/pages/Home";
import {Settings} from "~/pages/Settings";

// Get the initial, **non-reactive** state
const initialState = useStore.getState();

// Setup Ionic
setupIonicReact({
  mode: initialState.theme.mode,
});

/**
 * App shell
 * @returns JSX
 */
export const App: React.FC = () => {
  // Hooks
  const theme = useStore(state => state.theme);

  // Effects
  useEffect(() => {
    // Update Ionic mode
    setupIonicReact({
      mode: theme.mode,
    });

    // Update dark mode
    document.documentElement.classList.toggle("dark", theme.dark);
  }, [theme]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />

          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Home />
            </Route>

            <Route path="/settings" exact={true}>
              <Settings />
            </Route>

            <Route>
              <Error
                code="404"
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
