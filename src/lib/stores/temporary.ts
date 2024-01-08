/**
 * @file Temporary inter-page store
 */
/* eslint-disable jsdoc/require-jsdoc */
import {create} from "zustand";
import {devtools} from "zustand/middleware";

import {PostCreate} from "~/lib/types";

/**
 * Temporary store state and actions
 */
interface TemporaryStore {
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
}

/**
 * Temporary inter-page store
 */
export const useTemporaryStore = create<TemporaryStore>()(
  devtools(set => ({
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
  })),
);
