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
import {RegistrationResponseJSON} from "@simplewebauthn/types";
import {
  keyOutline,
  keySharp,
  logOutOutline,
  logOutSharp,
  refreshOutline,
  refreshSharp,
  trashBinOutline,
  trashBinSharp,
  warningOutline,
  warningSharp,
} from "ionicons/icons";
import {FC} from "react";
import {useHistory} from "react-router-dom";

import {
  beginRegistration,
  checkPasskeySupport,
  endRegistration,
} from "~/lib/api/auth";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {GlobalMessageMetadata, MeasurementSystem, Theme} from "~/lib/types";
import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/vars";

/**
 * Passkey failed to create credential message metadata symbol
 */
const PASSKEY_FAILED_TO_CREATE_CREDENTIAL_MESSAGE_METADATA_SYMBOL = Symbol(
  "settings.passkey-failed-to-create-credential",
);

/**
 * Passkey registered message metadata
 */
const PASSKEY_REGISTERED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("settings.passkey-registered"),
  name: "Passkey Registered",
  description: "The passkey has been successfully registered",
};

/**
 * Passkeys deleted message metadata
 */
const PASSKEYS_DELETED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("settings.passkeys-deleted"),
  name: "Passkeys Deleted",
  description: "All passkeys associated with your account have been deleted",
};

/**
 * Account deleted message metadata
 */
const ACCOUNT_DELETED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("settings.account-deleted"),
  name: "Account Deleted",
  description: "Your account has been successfully deleted",
};

/**
 * Settings page
 * @returns JSX
 */
export const Settings: FC = () => {
  // Hooks
  const setMessage = useEphemeralUIStore(state => state.setMessage);
  const theme = usePersistentStore(state => state.theme);
  const setTheme = usePersistentStore(state => state.setTheme);
  const showFABs = usePersistentStore(state => state.showFABs);
  const setShowFABs = usePersistentStore(state => state.setShowFABs);
  const slidingActions = usePersistentStore(state => state.useSlidingActions);

  const setSlidingActions = usePersistentStore(
    state => state.setUseSlidingActions,
  );

  const showAmbientEffect = usePersistentStore(
    state => state.showAmbientEffect,
  );

  const setShowAmbientEffect = usePersistentStore(
    state => state.setShowAmbientEffect,
  );

  const measurementSystem = usePersistentStore(
    state => state.measurementSystem,
  );

  const setMeasurementSystem = usePersistentStore(
    state => state.setMeasurementSystem,
  );

  const reset = usePersistentStore(state => state.reset);

  const history = useHistory();
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
        symbol: PASSKEY_FAILED_TO_CREATE_CREDENTIAL_MESSAGE_METADATA_SYMBOL,
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
    setMessage(PASSKEY_REGISTERED_MESSAGE_METADATA);
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
           * Delete passkeys handler
           */
          handler: async () => {
            // Delete the passkeys
            const {error} = await client.rpc("delete_webauthn_credentials");

            // Handle error
            if (error) {
              return;
            }

            // Display the message
            setMessage(PASSKEYS_DELETED_MESSAGE_METADATA);
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
           * Sign out handler
           */
          handler: async () => {
            // Sign out
            await client.auth.signOut();

            // Redirect to the home
            history.push("/");
          },
        },
      ],
    });

  /**
   * Delete account
   * @returns Promise
   */
  const deleteAccount = () =>
    present({
      header: "Delete Your Account",
      subHeader:
        "Are you sure you want to delete your account? This action cannot be undone.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete My Account",
          role: "destructive",
          /**
           * Delete account handler
           */
          handler: async () => {
            // Delete the account
            const {error} = await client.rpc("delete_account");

            // Handle error
            if (error) {
              return;
            }

            // Sign out
            await client.auth.signOut();

            // Redirect to the home
            history.push("/");

            // Display the message
            setMessage(ACCOUNT_DELETED_MESSAGE_METADATA);
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
              <IonIcon
                color="danger"
                slot="end"
                ios={refreshOutline}
                md={refreshSharp}
              />
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
              <IonIcon
                color="danger"
                slot="end"
                ios={trashBinOutline}
                md={trashBinSharp}
              />
            </IonItem>

            <IonItem button={true} onClick={signOut}>
              <IonLabel>Sign out</IonLabel>
              <IonIcon
                color="danger"
                slot="end"
                ios={logOutOutline}
                md={logOutSharp}
              />
            </IonItem>

            <IonItem button={true} onClick={deleteAccount}>
              <IonLabel>Delete Account</IonLabel>
              <IonIcon
                color="danger"
                slot="end"
                ios={warningOutline}
                md={warningSharp}
              />
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
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Links</IonLabel>
            </IonItemDivider>
            <IonItem
              rel="noreferrer"
              target="_blank"
              href="https://github.com/ColoradoSchoolOfMines/Beacon"
            >
              <IonLabel>Source code</IonLabel>
            </IonItem>

            <IonItem
              rel="noreferrer"
              target="_blank"
              href="https://github.com/ColoradoSchoolOfMines/beacon/issues/new/choose"
            >
              <IonLabel>Bug report/feature request</IonLabel>
            </IonItem>

            <IonItem target="_blank" href="/terms-and-conditions">
              <IonLabel>Terms and Conditions</IonLabel>
            </IonItem>

            <IonItem target="_blank" href="/privacy-policy">
              <IonLabel>Privacy Policy</IonLabel>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
