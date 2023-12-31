/**
 * @file Global store
 */
/* eslint-disable jsdoc/require-jsdoc */

import {User} from "@supabase/supabase-js";
import {create} from "zustand";
import {devtools} from "zustand/middleware";

import {GlobalMessage} from "~/lib/types";

/**
 * Store store state and actions
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
 * Global store
 */
export const useStore = create<Store>()(
  devtools(set => ({
    message: undefined,
    setMessage: (newMessage?: GlobalMessage) =>
      set(state => ({
        ...state,
        message: newMessage,
      })),
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
