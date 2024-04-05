/**
 * @file Ephemeral UI store
 */
/* eslint-disable jsdoc/require-jsdoc */
import {create} from "zustand";
import {devtools} from "zustand/middleware";

import {GlobalMessageMetadata, PostCreate} from "~/lib/types";

/**
 * Ephemeral UI store state and actions
 */
interface EphemeralUIStore {
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

  /**
   * Post being created
   */
  post?: Partial<PostCreate>;

  /**
   * Set the post being created
   * @param newPost New post or undefined to clear the post
   */
  setPost: (newPost?: Partial<PostCreate>) => void;
}

/**
 * Ephemeral UI store
 */
export const useEphemeralUIStore = create<EphemeralUIStore>()(
  devtools((set, get) => ({
    message: undefined,
    setMessage: (newMessage?: GlobalMessageMetadata) => {
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
    setEmail: (newEmail?: string) =>
      set(state => ({
        ...state,
        email: newEmail,
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
    post: undefined,
    setPost: (newPost?: Partial<PostCreate>) =>
      set(state => ({
        ...state,
        post: newPost,
      })),
  })),
);
