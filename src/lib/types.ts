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