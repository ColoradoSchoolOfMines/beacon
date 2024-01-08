/**
 * @file Global state
 */
/* eslint-disable jsdoc/require-jsdoc */

import {User} from "@supabase/supabase-js";
import {merge} from "lodash-es";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {
  DeepPartial,
  GlobalMessage,
  MeasurementSystem,
  PostCreate,
  Theme,
} from "~/lib/types";

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
   * Temporary email address being verified
   */
  email?: string;

  /**
   * Set the temporary email address
   * @param newEmail New email address or undefined to clear the email address
   */
  setEmail: (newEmail?: string) => void;

  /**
   * Temporary post being created
   */
  post?: Partial<PostCreate>;

  /**
   * Set the temporary post being created
   * @param newPost New post or undefined to clear the post
   */
  setPost: (newPost?: Partial<PostCreate>) => void;

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
   * Whether or not FAB (Floating Action Buttons) should be shown
   */
  showFABs: boolean;

  /**
   * Set whether or not FAB (Floating Action Buttons) should be shown
   * @param newShowFABs New value
   */
  setShowFABs: (newShowFABs: boolean) => void;

  /**
   * Whether or not the ambient effect should be shown
   */
  showAmbientEffect: boolean;

  /**
   * Set whether or not the ambient effect should be shown
   * @param newAmbientEffect New value
   */
  setShowAmbientEffect: (newAmbientEffect: boolean) => void;

  /**
   * Measurement system
   */
  measurementSystem: MeasurementSystem;

  /**
   * Set the measurement system
   * @param newMeasurementSystem New measurement system
   */
  setMeasurementSystem: (newMeasurementSystem: MeasurementSystem) => void;

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
  showFABs: true,
  showAmbientEffect: true,
  measurementSystem: MeasurementSystem.IMPERIAL,
};

/**
 * Global state store hook
 */
export const useStore = create<Store>()(
  devtools(
    persist<Store, [], [], DeepPartial<Store>>(
      set =>
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
          post: undefined,
          setPost: (newPost?: Partial<PostCreate>) =>
            set(state => ({
              ...state,
              post: newPost,
            })),
          user: undefined,
          setUser: (newUser: User) =>
            set(state => ({
              ...state,
              user: newUser,
            })),
          location: undefined,
          setLocation: (newLocation?: GeolocationPosition) =>
            set(state => ({
              ...state,
              location: newLocation,
            })),
          setTheme: (newTheme: Theme) =>
            set(state => ({
              ...state,
              theme: newTheme,
            })),
          setShowFABs: (newShowFABs: boolean) =>
            set(state => ({
              ...state,
              showFABs: newShowFABs,
            })),
          setShowAmbientEffect: (newAmbientEffect: boolean) =>
            set(state => ({
              ...state,
              showAmbientEffect: newAmbientEffect,
            })),
          setMeasurementSystem: (newMeasurementSystem: MeasurementSystem) =>
            set(state => ({
              ...state,
              measurementSystem: newMeasurementSystem,
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
          showFABs: state.showFABs,
          showAmbientEffect: state.showAmbientEffect,
          measurementSystem: state.measurementSystem,
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
