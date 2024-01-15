/**
 * @file Miscellaneous store
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

  /**
   * Refresh posts
   * @returns Promise
   */
  refreshPosts?: () => void | Promise<void>;

  /**
   * Register the refresh posts callback
   * @param newRefreshPosts New refresh posts callback
   */
  registerRefreshPosts: (newRefreshPosts: () => void | Promise<void>) => void;

  /**
   * Unregister the refresh posts callback
   * @param oldRefreshPosts Old refresh posts callback
   */
  unregisterRefreshPosts: (oldRefreshPosts: () => void | Promise<void>) => void;
}

/**
 * Miscellaneous store
 */
export const useMiscellaneousStore = create<Store>()(
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
    refreshPosts: undefined,
    registerRefreshPosts: (newRefreshPosts: () => void | Promise<void>) =>
      set(state => ({
        ...state,
        refreshPosts: newRefreshPosts,
      })),
    unregisterRefreshPosts: (oldRefreshPosts: () => void | Promise<void>) =>
      set(state => ({
        ...state,
        refreshPosts:
          state.refreshPosts === oldRefreshPosts
            ? undefined
            : state.refreshPosts,
      })),
  })),
);
