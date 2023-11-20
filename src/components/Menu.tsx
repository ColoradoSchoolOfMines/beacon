/**
 * @file Menu
 */

import {
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
  settingsOutline,
  settingsSharp,
} from "ionicons/icons";
import {useLocation} from "react-router-dom";

import logo from "~/assets/logo.png";
import {useStore} from "~/lib/state";

interface NavItem {
  url: string;
  authenticated: boolean;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    authenticated: false,
    url: "/",
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Authentication",
    authenticated: false,
    url: "/auth",
    iosIcon: lockClosedOutline,
    mdIcon: lockClosedSharp,
  },
  {
    title: "Nearby",
    authenticated: true,
    url: "/nearby",
    iosIcon: compassOutline,
    mdIcon: compassSharp,
  },
  {
    title: "Settings",
    authenticated: true,
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

  return (
    <IonMenu contentId="main" type="overlay">
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
            .filter(navItem => !navItem.authenticated || user !== undefined)
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
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
