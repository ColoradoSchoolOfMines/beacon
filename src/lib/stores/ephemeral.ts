/**
 * @file Ephemeral store
 */
/* eslint-disable jsdoc/require-jsdoc */
import {User} from "@supabase/supabase-js";
import {create} from "zustand";
import {devtools, subscribeWithSelector} from "zustand/middleware";

import {GlobalMessageMetadata, PostCreate} from "~/lib/types";

/**
 * Ephemeral store state and actions
 */
interface EphemeralStore {
  /**
   * Global message
   */
  message?: GlobalMessageMetadata;

  /**
   * Set the global message
   * @param newMessage Global message or undefined to clear the message
   */
  setMessage: (newMessage?: GlobalMessageMetadata) => void;

  /**
   * Email address being verified
   */
  email?: string;

  /**
   * Set the email address being verified
   * @param newEmail New email address or undefined to clear the email address
   */
  setEmail: (newEmail?: string) => void;

  /**
   * Refresh content
   * @returns Promise
   */
  refreshContent?: () => void | Promise<void>;

  /**
   * Register the refresh content callback
   * @param newRefreshContent New refresh content callback
   */
  registerRefreshContent: (
    newRefreshContent: () => void | Promise<void>,
  ) => void;

  /**
   * Unregister the refresh content callback
   * @param oldRefreshContent Old refresh content callback
   */
  unregisterRefreshContent: (
    oldRefreshContent: () => void | Promise<void>,
  ) => void;

  /**
   * Post being created
   */
  postBeingCreated?: Partial<PostCreate>;

  /**
   * Set the post being created
   * @param newPost New post or undefined to clear the post
   */
  setPostBeingCreated: (newPost?: Partial<PostCreate>) => void;

  /**
   * Current user
   * - `undefined` if not initialized
   * - `null` if no user is logged in
   * - `User` if a user is logged in
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

  /**
   * Waiters for the user's location
   */
  locationWaiters: (() => void)[];

  /**
   * Wait for the user's location to be set
   * @returns A promise that resolves when the location is set (Note that this promise may never resolve or may take a long time to resolve if the user does not grant location permissions immediately)
   */
  waitForLocation: () => Promise<void>;
}

/**
 * Ephemeral store
 */
export const useEphemeralStore = create<EphemeralStore>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      message: undefined,
      setMessage: newMessage => {
        // Don't update the message if the symbol is the same
        if (
          newMessage !== undefined &&
          get().message?.symbol === newMessage.symbol
        ) {
          return;
        }

        set(state => ({
          ...state,
          message: newMessage,
        }));
      },
      email: undefined,
      setEmail: (newEmail?) =>
        set(state => ({
          ...state,
          email: newEmail,
        })),
      refreshContent: undefined,
      registerRefreshContent: newRefreshContent =>
        set(state => ({
          ...state,
          refreshContent: newRefreshContent,
        })),
      unregisterRefreshContent: oldRefreshContent =>
        set(state => ({
          ...state,
          refreshContent:
            state.refreshContent === oldRefreshContent
              ? undefined
              : state.refreshContent,
        })),
      postBeingCreated: undefined,
      setPostBeingCreated: newPost =>
        set(state => ({
          ...state,
          postBeingCreated: newPost,
        })),
      user: undefined,
      setUser: newUser =>
        set(state => ({
          ...state,
          user: newUser,
        })),
      location: undefined,
      setLocation: async newLocation => {
        // Update the location
        set(state => ({
          ...state,
          location: newLocation,
        }));

        // Trigger all waiters
        await Promise.all(get().locationWaiters.map(waiter => waiter()));

        // Clear the waiters
        set(state => ({
          ...state,
          locationWaiters: [],
        }));
      },
      locationWaiters: [],
      waitForLocation: async () => {
        // Register the waiter only if a location isn't already set
        if (get().location === undefined) {
          return new Promise<void>(resolve =>
            set(state => ({
              ...state,
              locationWaiters: [
                ...state.locationWaiters,
                resolve,
              ],
            })),
          );
        }
      },
    })),
  ),
);
