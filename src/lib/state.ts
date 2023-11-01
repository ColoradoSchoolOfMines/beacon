/**
 * @file Global state
 */
/* eslint-disable jsdoc/require-jsdoc */

import {merge} from "lodash-es";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {DeepPartial} from "~/lib/types";

/**
 * Theme variant
 */
export enum ThemeVariant {
  /**
   * Light theme variant
   */
  LIGHT = "light",

  /**
   * Dark theme variant
   */
  DARK = "dark",
}

/**
 * Store state and actions
 */
interface Store {
  /**
   * Whether or not the store has been hydrated from storage
   */
  hydrated: boolean;

  /**
   * Set when the store has been hydrated from storage
   */
  setHydrated: () => void;

  /**
   * Theme state
   */
  theme: {
    /**
     * Theme variant
     */
    variant: ThemeVariant;

    /**
     * Set the theme variant
     * @param newVariant New variant
     */
    setVariant: (newVariant: ThemeVariant) => void;
  };

  /**
   * Reset the store to its default state
   */
  reset: () => void;
}

/**
 * Default store state
 */
const defaultState: DeepPartial<Store> = {
  theme: {
    variant:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ThemeVariant.DARK
        : ThemeVariant.LIGHT,
  },
};

/**
 * Global state store hook
 */
export const useStore = create<Store>()(
  devtools(
    persist<Store, [], [], DeepPartial<Store>>(
      set =>
        merge({}, defaultState, {
          hydrated: false,
          setHydrated: () =>
            set(() => ({
              hydrated: true,
            })),
          theme: {
            setVariant: (newVariant: ThemeVariant) =>
              set(state => ({
                theme: {
                  ...state.theme,
                  variant: newVariant,
                },
              })),
          },
          reset: () => set(state => merge({}, state, defaultState)),
        } as DeepPartial<Store>) as Store,
      {
        name: "global-state",
        storage: createJSONStorage(() => stateStorage),
        partialize: state => ({
          theme: {
            variant: state.theme.variant,
          },
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
