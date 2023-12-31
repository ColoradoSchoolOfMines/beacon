/**
 * @file Miscellaneous types
 */

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
 * Global information message modal
 */
export interface GlobalMessage {
  /**
   * Message name
   */
  name: string;

  /**
   * Message description
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
  AUTHENTICATED = "authenticated",

  /**
   * User must be unauthenticated
   */
  UNAUTHENTICATED = "unauthenticated",

  /**
   * User can be authenticated or unauthenticated
   */
  ANY = "any",
}
