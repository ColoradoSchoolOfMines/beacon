/**
 * @file Global state
 */

import {Mode} from "@ionic/core";
import {isPlatform} from "@ionic/react";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {DeepPartial} from "~/lib/types";

/**
 * State store
 */
export interface Store {
  theme: {
    dark: boolean;
    mode: Mode;
  };
}

/**
 * State store hook
 */
export const useStore = create<Store>()(
  devtools(
    persist<Store, [], [], DeepPartial<Store>>(
      () => ({
        theme: {
          dark:
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches,
          mode: isPlatform("ios") ? "ios" : "md",
        },
      }),
      {
        name: "global-state",
        storage: createJSONStorage(() => stateStorage),
        /**
         * Partialize the state
         * @param state Complete state
         * @returns Partial state
         */
        partialize: state => ({
          theme: state.theme,
        }),
      },
    ),
  ),
);
