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
  IonToggle,
  IonToolbar,
  useIonActionSheet,
} from "@ionic/react";
import {startRegistration} from "@simplewebauthn/browser";
import {RegistrationResponseJSON} from "@simplewebauthn/typescript-types";
import {
  keyOutline,
  keySharp,
  logOutOutline,
  logOutSharp,
  refreshOutline,
  refreshSharp,
  trashBinOutline,
  trashBinSharp,
} from "ionicons/icons";

import {
  beginRegistration,
  checkPasskeySupport,
  endRegistration,
} from "~/lib/api/auth";
import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";
import {MeasurementSystem, Theme} from "~/lib/types";
import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/vars";

/**
 * Settings page
 * @returns JSX
 */
export const Settings: React.FC = () => {
  // Hooks
  const setMessage = useStore(state => state.setMessage);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  const showFABs = useStore(state => state.showFABs);
  const setShowFABs = useStore(state => state.setShowFABs);
  const measurementSystem = useStore(state => state.measurementSystem);
  const setMeasurementSystem = useStore(state => state.setMeasurementSystem);
  const reset = useStore(state => state.reset);

  const [present] = useIonActionSheet();

  /**
   * Reset all settings
   * @returns Promise
   */
  const resetSettings = () =>
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

  // Methods
  /**
   * Register a passkey
   */
  const registerPasskey = async () => {
    // Begin the registration
    const beginRes = await beginRegistration();

    // Handle error
    if (!beginRes.ok) {
      return;
    }

    // Generate the credential
    let response: RegistrationResponseJSON | undefined = undefined;

    try {
      response = await startRegistration(beginRes.options!);
    } catch (error) {
      // Display the message
      setMessage({
        name: "Passkey Error",
        description: `Failed to create credential: ${error}`,
      });

      return;
    }

    // End the registration
    const endRes = await endRegistration(beginRes.challengeId!, response);

    // Handle error
    if (!endRes) {
      return;
    }

    // Display the message
    setMessage({
      name: "Passkey Registered",
      description: "The passkey has been successfully registered",
    });
  };

  /**
   * Delete all passkeys for the current user
   * @returns Promise
   */
  const deletePasskeys = () =>
    present({
      header: "Delete all passkeys",
      subHeader: "Are you sure you want to delete all passkeys?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          role: "destructive",
          /**
           * Handle the sign out
           */
          handler: async () => {
            const {error} = await client.rpc("delete_webauthn_credentials");

            // Handle error
            if (error) {
              return;
            }

            // Display the message
            setMessage({
              name: "Passkeys Deleted",
              description:
                "All passkeys associated with your account have been deleted",
            });
          },
        },
      ],
    });

  /**
   * Sign out
   * @returns Promise
   */
  const signOut = () =>
    present({
      header: "Sign out",
      subHeader: "Are you sure you want to sign out?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Sign out",
          role: "destructive",
          /**
           * Handle the sign out
           */
          handler: async () => {
            // Sign out
            await client.auth.signOut();
          },
        },
      ],
    });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>

          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonList className="py-0" inset={true}>
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
                <IonSelectOption value={Theme.LIGHT}>Light</IonSelectOption>
                <IonSelectOption value={Theme.DARK}>Dark</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonToggle
                checked={showFABs}
                onIonChange={event => setShowFABs(event.detail.checked)}
              >
                Show floating action buttons
              </IonToggle>
            </IonItem>

            <IonItem>
              <IonSelect
                interface="action-sheet"
                interfaceOptions={{
                  header: "Measurement system",
                  subHeader: "Select your preferred measurement system",
                }}
                label="Measurement system"
                labelPlacement="floating"
                onIonChange={event => setMeasurementSystem(event.detail.value)}
                value={measurementSystem}
              >
                <IonSelectOption value={MeasurementSystem.METRIC}>
                  Metric
                </IonSelectOption>
                <IonSelectOption value={MeasurementSystem.IMPERIAL}>
                  Imperial
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Miscellaneous</IonLabel>
            </IonItemDivider>

            <IonItem button={true} onClick={resetSettings}>
              <IonLabel>Reset all settings</IonLabel>
              <IonIcon slot="end" ios={refreshOutline} md={refreshSharp} />
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Account</IonLabel>
            </IonItemDivider>

            {checkPasskeySupport() && (
              <IonItem button={true} onClick={registerPasskey}>
                <IonLabel>Register passkey</IonLabel>
                <IonIcon slot="end" ios={keyOutline} md={keySharp} />
              </IonItem>
            )}

            <IonItem button={true} onClick={deletePasskeys}>
              <IonLabel>Delete all passkeys</IonLabel>
              <IonIcon slot="end" ios={trashBinOutline} md={trashBinSharp} />
            </IonItem>

            <IonItem button={true} onClick={signOut}>
              <IonLabel>Sign out</IonLabel>
              <IonIcon slot="end" ios={logOutOutline} md={logOutSharp} />
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>About</IonLabel>
            </IonItemDivider>

            <IonItem>
              <IonLabel>Version</IonLabel>
              <IonNote className="ml-0 my-4 p-0" slot="end">
                {VERSION}
              </IonNote>
            </IonItem>

            <IonItem>
              <IonLabel>Branch</IonLabel>
              <IonNote className="ml-0 my-4 p-0" slot="end">
                {GIT_BRANCH}
              </IonNote>
            </IonItem>

            <IonItem>
              <IonLabel>Commit</IonLabel>
              <IonNote className="ml-0 my-4 p-0" slot="end">
                {GIT_COMMIT}
              </IonNote>
            </IonItem>

            <IonItem
              rel="noreferrer"
              target="_blank"
              href="https://github.com/ColoradoSchoolOfMines/Beacon"
            >
              <IonLabel>Source</IonLabel>
              <IonNote className="ml-0 my-4 p-0 text-[0.9rem]" slot="end">
                github.com
              </IonNote>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
