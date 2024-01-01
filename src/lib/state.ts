/**
 * @file Global state
 */
/* eslint-disable jsdoc/require-jsdoc */

import {User} from "@supabase/supabase-js";
import {isEqual, merge} from "lodash-es";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {client} from "~/lib/supabase";
import {DeepPartial, GlobalMessage, Theme} from "~/lib/types";

/**
 * Store state and actions
 */
interface Store {
  /**
   * Global message
   */
  message?: GlobalMessage;

  /**
   * Set the global message
   * @param newMessage Global message or undefined to clear the message
   */
  setMessage: (newMessage?: GlobalMessage) => void;

  /**
   * Temporary email address
   */
  email?: string;

  /**
   * Set the temporary email address
   * @param newEmail New email address or undefined to clear the email address
   */
  setEmail: (newEmail?: string) => void;

  /**
   * Current user
   */
  user?: User;

  /**
   * Set the current user
   * @param newUser New user or undefined to clear the user
   */
  setUser: (newUser?: User) => void;

  /**
   * Current geolocation
   */
  location?: GeolocationPosition;

  /**
   * Set the current geolocation
   * @param newLocation New geolocation or undefined to clear the geolocation
   */
  setLocation: (newLocation?: GeolocationPosition) => void;

  /**
   * Theme
   */
  theme: Theme;

  /**
   * Set the theme
   * @param newTheme New theme
   */
  setTheme: (newTheme: Theme) => void;

  /**
   * Whether or not the store has been hydrated from storage
   */
  hydrated: boolean;

  /**
   * Set when the store has been hydrated from storage
   */
  setHydrated: () => void;

  /**
   * Reset the store to its default state
   */
  reset: () => void;
}

/**
 * Default persisted store state
 */
const defaultState: DeepPartial<Store> = {
  theme:
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.DARK
      : Theme.LIGHT,
};

/**
 * Global state store hook
 */
export const useStore = create<Store>()(
  devtools(
    persist<Store, [], [], DeepPartial<Store>>(
      (set, get) =>
        merge({}, defaultState, {
          message: undefined,
          setMessage: (newMessage?: GlobalMessage) =>
            set(state => ({
              ...state,
              message: newMessage,
            })),
          email: undefined,
          setEmail: (newEmail?: string) =>
            set(state => ({
              ...state,
              email: newEmail,
            })),
          user: undefined,
          setUser: (newUser: User) =>
            set(state => ({
              ...state,
              user: newUser,
            })),
          location: undefined,
          setLocation: async (newLocation?: GeolocationPosition) => {
            const oldLocation = get().location;

            // Update the frontend
            set(state => ({
              ...state,
              location: newLocation,
            }));

            // Update the backend
            if (
              newLocation !== undefined &&
              !isEqual(newLocation, oldLocation)
            ) {
              const {error} = await client.from("locations").insert({
                // eslint-disable-next-line camelcase
                created_at: new Date(newLocation?.timestamp).toISOString(),
                location: `POINT(${newLocation?.coords.longitude} ${newLocation?.coords.latitude})`,
              });

              // Handle error
              if (error !== null) {
                get().setMessage({
                  name: "Failed to update location",
                  description: error.message,
                });

                return;
              }
            }
          },
          setTheme: (newTheme: Theme) =>
            set(state => ({
              ...state,
              theme: newTheme,
            })),
          hydrated: false,
          setHydrated: () =>
            set(() => ({
              hydrated: true,
            })),
          reset: () => set(state => merge({}, state, defaultState)),
        } as DeepPartial<Store>) as Store,
      {
        name: "global-state",
        storage: createJSONStorage(() => stateStorage),
        partialize: state => ({
          theme: state.theme,
        }),
        merge: (persisted, current) => merge({}, current, persisted),
        onRehydrateStorage: state => () => {
          if (state === undefined) {
            throw new Error("State is undefined");
          }

          // Update the hydrated state
          state.setHydrated();
        },
      },
    ),
  ),
);

/**
 * Geolocation watcher ID
 */
let geolocationWatcherId: number | undefined;

// Watch the user's geolocation
useStore.subscribe(async state => {
  // Check if the watcher is already running
  if (geolocationWatcherId !== undefined) {
    return;
  }

  // Check if geolocation is supported
  if (navigator.geolocation === undefined) {
    // Display the message
    state.setMessage({
      name: "Geolocation error",
      description: "Your browser does not support geolocation.",
    });

    return;
  }

  // Check if the geolocation permission has been denied
  const status = await navigator.permissions.query({name: "geolocation"});

  if (status.state === "denied") {
    // Display the message
    state.setMessage({
      name: "Geolocation error",
      description:
        "You have denied access to your geolocation, but it is required to show nearby posts. You can grant Beacon access to your geolocation in your browser settings.",
    });

    return;
  }

  // Watch the user's geolocation
  try {
    geolocationWatcherId = navigator.geolocation.watchPosition(
      state.setLocation,
      error => {
        // Display the message
        state.setMessage({
          name: "Geolocation error",
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 5,
        timeout: 1000 * 10,
      },
    );
  } catch (error) {
    // Display the message
    state.setMessage({
      name: "Geolocation error",
      description: `Your geolocation could not be determined: ${error}`,
    });

    return;
  }
});
