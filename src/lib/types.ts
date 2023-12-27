/**
 * @file Miscellaneous types
 */

import {User} from "@supabase/supabase-js";

/**
 * Deep partial type
 * @param T Type
 * @see https://stackoverflow.com/a/51365037
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object | undefined
      ? DeepPartial<T[P]>
      : T[P];
};

/**
 * Get all keys of `T` whose value type is `KT`
 * @param T Type
 * @param KT Key type
 * @see https://reddit.com/comments/jxoejv/comment/gcy6rkt
 */
export type KeysOfType<T, KT> = {
  [K in keyof T]: T[K] extends KT ? K : never;
}[keyof T];

/**
 * OTP credential
 */
export interface OTPCredential extends Credential {
  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/OTPCredential/code) */
  readonly code: string;
}

/**
 * Theme
 */
export enum Theme {
  /**
   * Light theme
   */
  LIGHT = "light",

  /**
   * Dark theme
   */
  DARK = "dark",
}

/**
 * Global error
 */
export interface GlobalError {
  /**
   * Error name
   */
  name: string;

  /**
   * Error description
   */
  description: string;
}

/**
 * Required authentication state
 */
export enum RequiredAuthState {
  /**
   * User must be authenticated
   */
  AUTHENTICATED,

  /**
   * User must be unauthenticated
   */
  UNAUTHENTICATED,

  /**
   * User can be authenticated or unauthenticated
   */
  ANY,
}

/**
 * Check if the user meets the required authentication state
 * @param user User
 * @param requiredState Required authentication state
 * @returns Whether the user meets the required authentication state
 */
export const checkRequiredAuthState = (
  user: User | undefined,
  requiredState: RequiredAuthState,
): boolean => {
  switch (requiredState) {
    case RequiredAuthState.AUTHENTICATED:
      return user !== undefined;

    case RequiredAuthState.UNAUTHENTICATED:
      return user === undefined;

    case RequiredAuthState.ANY:
      return true;
  }
};
