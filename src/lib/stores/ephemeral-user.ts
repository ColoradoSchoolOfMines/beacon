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
   * `undefined` if not initialized
   * `null` if no user is logged in
   * `User` if a user is logged in
   */
  user: User | null | undefined;

  /**
   * Set the current user
   * @param newUser New user or null to clear the user
   */
  setUser: (newUser: User | null) => void;

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
    setUser: newUser =>
      set(state => ({
        ...state,
        user: newUser,
      })),
    location: undefined,
    setLocation: newLocation =>
      set(state => ({
        ...state,
        location: newLocation,
      })),
  })),
);
