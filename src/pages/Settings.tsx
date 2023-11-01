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

import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/env";
import {useStore} from "~/lib/state";

/**
 * Settings page component
 * @returns JSX
 */
export const Settings: React.FC = () => {
  // Hooks
  const variant = useStore(state => state.theme.variant);
  const setVariant = useStore(state => state.theme.setVariant);
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

      <IonContent forceOverscroll={false} fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Theme</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonSelect
                interface="action-sheet"
                interfaceOptions={{
                  header: "Theme variant",
                  subHeader: "Select your preferred theme variant",
                }}
                label="Variant"
                labelPlacement="floating"
                onIonChange={event => setVariant(event.detail.value)}
                value={variant}
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
