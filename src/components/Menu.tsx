/**
 * @file Menu
 */

import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
} from "@ionic/react";
import {
  compassOutline,
  compassSharp,
  homeOutline,
  homeSharp,
  lockClosedOutline,
  lockClosedSharp,
  logOutOutline,
  logOutSharp,
  settingsOutline,
  settingsSharp,
} from "ionicons/icons";
import {useRef} from "react";
import {useLocation} from "react-router-dom";

import logo from "~/assets/logo.png";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {checkRequiredAuthState, RequiredAuthState} from "~/lib/types";

interface NavItem {
  url: string;
  requiredState: RequiredAuthState;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    requiredState: RequiredAuthState.ANY,
    url: "/",
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Authentication",
    requiredState: RequiredAuthState.UNAUTHENTICATED,
    url: "/auth",
    iosIcon: lockClosedOutline,
    mdIcon: lockClosedSharp,
  },
  {
    title: "Nearby",
    requiredState: RequiredAuthState.AUTHENTICATED,
    url: "/nearby",
    iosIcon: compassOutline,
    mdIcon: compassSharp,
  },
  {
    title: "Settings",
    requiredState: RequiredAuthState.AUTHENTICATED,
    url: "/settings",
    iosIcon: settingsOutline,
    mdIcon: settingsSharp,
  },
];

/**
 * Menu component
 * @returns JSX
 */
export const Menu: React.FC = () => {
  // Hooks
  const user = useStore(state => state.user);
  const location = useLocation();
  const menu = useRef<HTMLIonMenuElement>(null);

  // Methods
  /**
   * Sign out
   */
  const signOut = async () => {
    // Sign out
    await client.auth.signOut();

    // Close the menu
    menu.current?.close();
  };

  return (
    <IonMenu contentId="main" type="overlay" ref={menu}>
      <IonContent forceOverscroll={false}>
        <IonList className="flex flex-col h-full">
          {/* Header */}
          <IonListHeader>
            <div className="flex flex-row items-center justify-center my-8 w-full">
              <IonImg alt="Beacon logo" className="h-14 w-14 mr-2" src={logo} />
              <span className="ml-2 text-3xl">Beacon</span>
            </div>
          </IonListHeader>

          {/* Navigation items */}
          {navItems
            .filter(navItem =>
              checkRequiredAuthState(user, navItem.requiredState),
            )
            .map((navItem, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={
                      location.pathname === navItem.url ? "selected" : ""
                    }
                    routerLink={navItem.url}
                    routerDirection="none"
                    lines="none"
                    detail={false}
                  >
                    <IonIcon
                      aria-hidden="true"
                      slot="start"
                      ios={navItem.iosIcon}
                      md={navItem.mdIcon}
                    />

                    <IonLabel>{navItem.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <IonItem>
            <IonButton
              className="mx-0 my-4 overflow-hidden rounded-lg w-full"
              size="default"
              expand="full"
              onClick={signOut}
            >
              <IonIcon slot="start" ios={logOutOutline} md={logOutSharp} />
              <IonLabel>Sign out</IonLabel>
            </IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
