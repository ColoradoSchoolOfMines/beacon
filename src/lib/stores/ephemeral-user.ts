/**
 * @file Ephemeral user metadata store
 */
/* eslint-disable jsdoc/require-jsdoc */

import {User} from "@supabase/supabase-js";
import {create} from "zustand";
import {devtools} from "zustand/middleware";

/**
 * Ephemeral user store state and actions
 */
interface EphemeralUserStore {
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
}

/**
 * Ephemeral user metadata store
 */
export const useEphemeralUserStore = create<EphemeralUserStore>()(
  devtools(set => ({
    user: undefined,
    setUser: (newUser?: User) =>
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
  })),
);
