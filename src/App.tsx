/**
 * @file App shell
 */

import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  isPlatform,
  setupIonicReact,
} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import {Redirect, Route} from "react-router-dom";
import Menu from "~/components/Menu";
import Page from "~/pages/Page";

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
import "~/theme/variables.css";

// Setup Ionic
setupIonicReact({
  mode: isPlatform("ios") ? "ios" : "md",
});

/**
 * App shell
 * @returns JSX
 */
const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />

          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Redirect to="/folder/Inbox" />
            </Route>

            <Route path="/folder/:name" exact={true}>
              <Page />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
