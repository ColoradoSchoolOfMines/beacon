/**
 * @file Menu component
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
  createOutline,
  createSharp,
  homeOutline,
  homeSharp,
  lockClosedOutline,
  lockClosedSharp,
  navigateCircleOutline,
  navigateCircleSharp,
  settingsOutline,
  settingsSharp,
} from "ionicons/icons";
import {FC, useRef} from "react";
import {useLocation} from "react-router-dom";

import logo from "~/assets/logo.png";
import {useEphemeralUserStore} from "~/lib/stores/ephemeral-user";
import {AuthState} from "~/lib/types";
import {getAuthState} from "~/lib/utils";

/**
 * Menu navigation item position
 */
enum NavItemPosition {
  TOP = "top",
  BOTTOM = "bottom",
}

/**
 * Menu navigation item
 */
interface NavItem {
  /**
   * Item URL
   */
  url: string;

  /**
   * Required authentication state to show this item or undefined if the item is always available
   */
  requiredState: AuthState | undefined;

  /**
   * Item position
   */
  position: NavItemPosition;

  /**
   * iOS icon
   */
  iosIcon: string;

  /**
   * Material Design icon
   */
  mdIcon: string;

  /**
   * Item title
   */
  title: string;
}

/**
 * Menu navigation items
 */
const navItems: NavItem[] = [
  {
    title: "Home",
    requiredState: AuthState.UNAUTHENTICATED,
    url: "/",
    position: NavItemPosition.TOP,
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Authentication",
    requiredState: AuthState.UNAUTHENTICATED,
    url: "/auth/1",
    position: NavItemPosition.TOP,
    iosIcon: lockClosedOutline,
    mdIcon: lockClosedSharp,
  },
  {
    title: "Nearby",
    requiredState: AuthState.AUTHENTICATED_TERMS,
    url: "/nearby",
    position: NavItemPosition.TOP,
    iosIcon: navigateCircleOutline,
    mdIcon: navigateCircleSharp,
  },
  {
    title: "Create Post",
    requiredState: AuthState.AUTHENTICATED_TERMS,
    url: "/posts/create/1",
    position: NavItemPosition.TOP,
    iosIcon: createOutline,
    mdIcon: createSharp,
  },
  {
    title: "Settings",
    requiredState: AuthState.AUTHENTICATED_TERMS,
    url: "/settings",
    position: NavItemPosition.BOTTOM,
    iosIcon: settingsOutline,
    mdIcon: settingsSharp,
  },
];

/**
 * Navigation item component
 * @param item Navigation item
 * @returns JSX
 */
const NavItem: FC<NavItem> = item => {
  // Hooks
  const location = useLocation();

  return (
    <IonMenuToggle autoHide={false}>
      <IonItem
        className={location.pathname === item.url ? "selected" : ""}
        routerLink={item.url}
        routerDirection="none"
        lines="none"
        detail={false}
      >
        <IonIcon
          aria-hidden="true"
          slot="start"
          ios={item.iosIcon}
          md={item.mdIcon}
        />

        <IonLabel>{item.title}</IonLabel>
      </IonItem>
    </IonMenuToggle>
  );
};

/**
 * Menu component
 * @returns JSX
 */
export const Menu: FC = () => {
  // Hooks
  const user = useEphemeralUserStore(state => state.user);
  const menu = useRef<HTMLIonMenuElement>(null);

  return (
    <IonMenu className="md:max-w-64" contentId="main" type="overlay" ref={menu}>
      <IonContent>
        <IonList className="flex flex-col h-full py-4">
          <IonListHeader className="p-0">
            <div className="flex flex-row items-center justify-center my-8 w-full">
              <IonImg alt="Beacon logo" className="h-14 w-14 mr-2" src={logo} />
              <span className="ml-2 text-3xl">Beacon</span>
            </div>
          </IonListHeader>

          {navItems
            .filter(
              navItem =>
                navItem.position === NavItemPosition.TOP &&
                (navItem.requiredState === undefined ||
                  navItem.requiredState === getAuthState(user)),
            )
            .map((navItem, index) => (
              <NavItem key={index} {...navItem} />
            ))}

          <div className="flex-1" />

          {navItems
            .filter(
              navItem =>
                navItem.position === NavItemPosition.BOTTOM &&
                (navItem.requiredState === undefined ||
                  navItem.requiredState === getAuthState(user)),
            )
            .map((navItem, index) => (
              <NavItem key={index} {...navItem} />
            ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
