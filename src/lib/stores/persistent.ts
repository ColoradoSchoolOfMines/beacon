/**
 * @file Persistent store
 */
/* eslint-disable jsdoc/require-jsdoc */
import {merge} from "lodash-es";
import {create} from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

import {stateStorage} from "~/lib/storage";
import {DeepPartial, MeasurementSystem, Theme} from "~/lib/types";

/**
 * Persistent store state and actions
 */
interface PersistentStore {
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
   * Whether or not sliding action should be enabled
   */
  useSlidingActions: boolean;

  /**
   * Set whether or not sliding action should be enabled
   * @param newSlidingActions New value
   */
  setUseSlidingActions: (newSlidingActions: boolean) => void;

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
   * Reset the store to its default state
   */
  reset: () => void;
}

/**
 * Default state
 */
const defaultState: DeepPartial<PersistentStore> = {
  theme:
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.DARK
      : Theme.LIGHT,
  showFABs: true,
  useSlidingActions: true,
  showAmbientEffect: true,
  measurementSystem: MeasurementSystem.IMPERIAL,
};

/**
 * Persistent store
 */
export const usePersistentStore = create<PersistentStore>()(
  subscribeWithSelector(
    devtools(
      persist<PersistentStore, [], [], DeepPartial<PersistentStore>>(
        set =>
          merge({}, defaultState, {
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
            setUseSlidingActions: (newSlidingActions: boolean) =>
              set(state => ({
                ...state,
                useSlidingActions: newSlidingActions,
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
            reset: () => set(state => merge({}, state, defaultState)),
          } as DeepPartial<PersistentStore>) as PersistentStore,
        {
          name: "persistent",
          storage: createJSONStorage(() => stateStorage),
          partialize: state => ({
            showFABs: state.showFABs,
            showAmbientEffect: state.showAmbientEffect,
            measurementSystem: state.measurementSystem,
            theme: state.theme,
          }),
          merge: (persisted, current) => merge({}, current, persisted),
        },
      ),
    ),
  ),
);
