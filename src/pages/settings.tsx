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
  IonModal,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  isPlatform,
  useIonActionSheet,
} from "@ionic/react";
import {
  downloadOutline,
  downloadSharp,
  ellipsisVertical,
  logOutOutline,
  logOutSharp,
  menuSharp,
  refreshOutline,
  refreshSharp,
  warningOutline,
  warningSharp,
} from "ionicons/icons";
import {FC, useEffect, useRef, useState} from "react";
import {useHistory} from "react-router-dom";

import AddToHomeScreen from "~/assets/icons/md-add-to-home-screen.svg?react";
import PlusApp from "~/assets/icons/sf-symbols-plus.app.svg?react";
import SquareAndArrowUp from "~/assets/icons/sf-symbols-square.and.arrow.up.svg?react";
import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {usePersistentStore} from "~/lib/stores/persistent";
import {client} from "~/lib/supabase";
import {GlobalMessageMetadata, MeasurementSystem, Theme} from "~/lib/types";
import {GIT_BRANCH, GIT_COMMIT, VERSION} from "~/lib/vars";
import styles from "~/pages/settings.module.css";

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
  const [beforeInstallPromptEvent, setBeforeInstallPromptEvent] =
    useState<BeforeInstallPromptEvent>();

  const [appInstalled, setAppInstalled] = useState(
    window.matchMedia("(display-mode: standalone)").matches,
  );

  const appInstallInstructionsModal = useRef<HTMLIonModalElement>(null);

  const setMessage = useEphemeralStore(state => state.setMessage);
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

  // Methods
  /**
   * Begin the app installation process
   */
  const installApp = async () => {
    await (beforeInstallPromptEvent === undefined
      ? appInstallInstructionsModal.current?.present()
      : beforeInstallPromptEvent.prompt());
  };

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

  // Effects
  useEffect(() => {
    // Capture the installed event
    window.addEventListener("appinstalled", () => setAppInstalled(true));

    // Capture the installable event
    window.addEventListener(
      "beforeinstallprompt",
      event => {
        event.preventDefault();
        setBeforeInstallPromptEvent(event as BeforeInstallPromptEvent);
      },
      {
        once: true,
      },
    );
  }, []);

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

      <IonModal
        className={styles.modal}
        ref={appInstallInstructionsModal}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
      >
        <div className="flex flex-col items-center justify-center p-4 w-full">
          <h2 className="font-bold mb-2 text-center text-lg">
            App Install Instructions
          </h2>

          <p className="mb-2">
            This website is a Progresive Web App (PWA), meaning it has app
            functionality. You can install it on your device by following the
            below instructions:
          </p>

          <ol className="list-decimal ml-4">
            {(() => {
              if (isPlatform("ios")) {
                return (
                  <>
                    <li>
                      Press the share button on the menu bar below.
                      <div className="my-4 w-full">
                        <SquareAndArrowUp className="dark:fill-[#4693ff] dark:stroke-[#4693ff] fill-[#007aff] h-16 mx-auto stroke-[#007aff] w-16" />
                      </div>
                    </li>
                    <li>
                      Select <q>Add to Home Screen</q>.
                      <div className="my-4 w-full">
                        <PlusApp className="dark:fill-white dark:stroke-white fill-black h-14 mx-auto stroke-black w-14" />
                      </div>
                    </li>
                  </>
                );
              } else if (isPlatform("android")) {
                return (
                  <>
                    <li>
                      Press the three dots on the menu bar above.
                      <div className="my-4 w-full">
                        <IonIcon
                          className="block dark:fill-white dark:stroke-white fill-black h-14 mx-auto stroke-black w-14"
                          icon={ellipsisVertical}
                        />
                      </div>
                    </li>
                    <li>
                      Select <q>Add to Home screen</q>.
                      <div className="my-4 w-full">
                        <AddToHomeScreen className="dark:fill-white dark:stroke-white fill-black h-16 mx-auto stroke-black w-16" />
                      </div>
                    </li>
                  </>
                );
              } else {
                return (
                  <>
                    <li>
                      Open your browser&apos;s menu.
                      <div className="my-4 w-full">
                        <IonIcon
                          className="block dark:fill-white dark:stroke-white fill-black h-16 mx-auto stroke-black w-16"
                          icon={menuSharp}
                        />
                      </div>
                    </li>
                    <li>
                      Select <q>Add to Home Screen</q>, <q>Install Beacon</q>,
                      or similar option.
                      <div className="my-4 w-full">
                        <AddToHomeScreen className="dark:fill-white dark:stroke-white fill-black h-16 mx-auto stroke-black w-16" />
                      </div>
                    </li>
                  </>
                );
              }
            })()}
          </ol>
        </div>
      </IonModal>

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

            <IonItem button={true} disabled={appInstalled} onClick={installApp}>
              <IonLabel>
                Install app {appInstalled ? "(Already Installed)" : ""}
              </IonLabel>
              <IonIcon
                color="success"
                slot="end"
                ios={downloadOutline}
                md={downloadSharp}
              />
            </IonItem>

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

            <IonItem routerLink="/faq">
              <IonLabel>Frequently Asked Questions</IonLabel>
            </IonItem>

            <IonItem routerLink="/terms-and-conditions">
              <IonLabel>Terms and Conditions</IonLabel>
            </IonItem>

            <IonItem routerLink="/privacy-policy">
              <IonLabel>Privacy Policy</IonLabel>
            </IonItem>

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
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
