/**
 * @file Ephemeral UI store
 */
/* eslint-disable jsdoc/require-jsdoc */
import {create} from "zustand";
import {devtools} from "zustand/middleware";

import {GlobalMessageMetadata, Post, PostCreate} from "~/lib/types";

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
    refreshContent: undefined,
    registerRefreshContent: (newRefreshContent: () => void | Promise<void>) =>
      set(state => ({
        ...state,
        refreshContent: newRefreshContent,
      })),
    unregisterRefreshContent: (oldRefreshContent: () => void | Promise<void>) =>
      set(state => ({
        ...state,
        refreshContent:
          state.refreshContent === oldRefreshContent
            ? undefined
            : state.refreshContent,
      })),
    postBeingCreated: undefined,
    setPostBeingCreated: (newPost?: Partial<PostCreate>) =>
      set(state => ({
        ...state,
        postBeingCreated: newPost,
      })),
    postBeingCommentedOn: undefined,
    setPostBeingCommentedOn: (newPost?: Post) =>
      set(state => ({
        ...state,
        postBeingCommentedOn: newPost,
      })),
  })),
);
