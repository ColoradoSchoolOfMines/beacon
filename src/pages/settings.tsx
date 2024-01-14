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
import {FC} from "react";

import {
  beginRegistration,
  checkPasskeySupport,
  endRegistration,
} from "~/lib/api/auth";
import {useMiscellaneousStore} from "~/lib/stores/miscellaneous";
import {useSettingsStore} from "~/lib/stores/settings";
import {client} from "~/lib/supabase";
import {MeasurementSystem, Theme} from "~/lib/types";
import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/vars";

/**
 * Settings page
 * @returns JSX
 */
export const Settings: FC = () => {
  // Hooks
  const setMessage = useMiscellaneousStore(state => state.setMessage);
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);
  const showFABs = useSettingsStore(state => state.showFABs);
  const setShowFABs = useSettingsStore(state => state.setShowFABs);
  const slidingActions = useSettingsStore(state => state.useSlidingActions);

  const setSlidingActions = useSettingsStore(
    state => state.setUseSlidingActions,
  );

  const showAmbientEffect = useSettingsStore(state => state.showAmbientEffect);

  const setShowAmbientEffect = useSettingsStore(
    state => state.setShowAmbientEffect,
  );

  const measurementSystem = useSettingsStore(state => state.measurementSystem);

  const setMeasurementSystem = useSettingsStore(
    state => state.setMeasurementSystem,
  );

  const reset = useSettingsStore(state => state.reset);

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
              <IonToggle
                checked={slidingActions}
                onIonChange={event => setSlidingActions(event.detail.checked)}
              >
                Use sliding actions on posts
              </IonToggle>
            </IonItem>

            <IonItem>
              <IonToggle
                checked={showAmbientEffect}
                onIonChange={event =>
                  setShowAmbientEffect(event.detail.checked)
                }
              >
                Show ambient effect below posts
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
              <IonNote className="ml-0 p-0" slot="end">
                {VERSION}
              </IonNote>
            </IonItem>

            <IonItem>
              <IonLabel>Branch</IonLabel>
              <IonNote className="ml-0 p-0" slot="end">
                {GIT_BRANCH}
              </IonNote>
            </IonItem>

            <IonItem>
              <IonLabel>Commit</IonLabel>
              <IonNote className="ml-0 p-0" slot="end">
                {GIT_COMMIT}
              </IonNote>
            </IonItem>

            <IonItem
              rel="noreferrer"
              target="_blank"
              href="https://github.com/ColoradoSchoolOfMines/Beacon"
            >
              <IonLabel>Source code</IonLabel>
              <IonNote className="ml-0 p-0 text-[0.9rem]" slot="end">
                github.com/...
              </IonNote>
            </IonItem>

            <IonItem
              rel="noreferrer"
              target="_blank"
              href="https://github.com/ColoradoSchoolOfMines/beacon/issues/new/choose"
            >
              <IonLabel>Bug report/feature request</IonLabel>
              <IonNote className="ml-0 p-0 text-[0.9rem]" slot="end">
                github.com/...
              </IonNote>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
