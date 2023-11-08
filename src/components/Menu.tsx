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
  settingsOutline,
  settingsSharp,
} from "ionicons/icons";
import {useLocation} from "react-router-dom";

import logo from "~/assets/logo.png";

interface NavItem {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const navItem: NavItem[] = [
  {
    title: "Home",
    url: "/",
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Nearby",
    url: "/nearby",
    iosIcon: compassOutline,
    mdIcon: compassSharp,
  },
  {
    title: "Settings",
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
          {navItem.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? "selected" : ""
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    aria-hidden="true"
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />

                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
