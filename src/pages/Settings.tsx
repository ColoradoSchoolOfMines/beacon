/**
 * @file Setting page
 */

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from "@ionic/react";
import {refreshOutline, refreshSharp} from "ionicons/icons";

import {useStore} from "~/lib/state";
import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/vars";

/**
 * Settings page component
 * @returns JSX
 */
export const Settings: React.FC = () => {
  // Hooks
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  const reset = useStore(state => state.reset);
  const [present] = useIonActionSheet();

  // Methods
  /**
   * Reset all settings
   */
  const resetSettings = () => {
    present({
      header: "Reset all settings",
      subHeader:
        "Are you sure you want to reset all settings? You will be signed out.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Reset",
          role: "destructive",
          handler: reset,
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent forceOverscroll={false}>
        <IonList className="py-0">
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Look and Feel</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonSelect
                interface="action-sheet"
                interfaceOptions={{
                  header: "Theme",
                  subHeader: "Select your preferred theme",
                }}
                label="Theme"
                labelPlacement="floating"
                onIonChange={event => setTheme(event.detail.value)}
                value={theme}
              >
                <IonSelectOption value="light">Light</IonSelectOption>
                <IonSelectOption value="dark">Dark</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Miscellaneous</IonLabel>
            </IonItemDivider>
            <IonItem onClick={resetSettings}>
              <IonLabel>Reset all settings</IonLabel>
              <IonIcon slot="end" ios={refreshOutline} md={refreshSharp} />
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>About</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>Version</IonLabel>
              <IonNote slot="end">{VERSION}</IonNote>
            </IonItem>
            <IonItem>
              <IonLabel>Branch</IonLabel>
              <IonNote slot="end">{GIT_BRANCH}</IonNote>
            </IonItem>
            <IonItem>
              <IonLabel>Commit</IonLabel>
              <IonNote slot="end">{GIT_COMMIT}</IonNote>
            </IonItem>
            <IonItem href="https://github.com/ColoradoSchoolOfMines/Beacon">
              <IonLabel>Project</IonLabel>
              <IonNote slot="end">github.com</IonNote>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
