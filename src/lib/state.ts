/**
 * @file Global state
 */
/* eslint-disable jsdoc/require-jsdoc */

import {User} from "@supabase/supabase-js";
import {merge} from "lodash-es";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {DeepPartial, GlobalError, Theme} from "~/lib/types";

/**
 * Store state and actions
 */
interface Store {
  /**
   * Global error
   */
  error?: GlobalError;

  /**
   * Set the global error
   * @param newError Global error or undefined to clear the error
   */
  setError: (newError?: GlobalError) => void;

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
   * Whether or not the store has been hydrated from storage
   */
  hydrated: boolean;

  /**
   * Set when the store has been hydrated from storage
   */
  setHydrated: () => void;

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
   * Reset the store to its default state
   */
  reset: () => void;
}

/**
 * Default store state
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
      set =>
        merge({}, defaultState, {
          error: undefined,
          setError: (error?: GlobalError) =>
            set(state => ({
              ...state,
              error,
            })),
          user: undefined,
          setUser: (user: User) =>
            set(state => ({
              ...state,
              user,
            })),
          hydrated: false,
          setHydrated: () =>
            set(() => ({
              hydrated: true,
            })),
          setTheme: (newTheme: Theme) =>
            set(state => ({
              ...state,
              theme: newTheme,
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
