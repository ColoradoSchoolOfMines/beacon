/**
 * @file Miscellaneous types
 */

import {Database} from "~/lib/schema";

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
 * Mandatory (required + non-nullable) type
 * @param T Type
 */
export type Mandatory<T> = Exclude<T, undefined | null>;

/**
 * Deep mandatory (required + non-nullable) type
 * @param T Type
 */
export type DeepMandatory<T> = {
  [P in keyof T]-?: T[P] extends (infer U)[]
    ? DeepMandatory<U>[]
    : DeepMandatory<Mandatory<T[P]>>;
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

/**
 * WebAuthn challenge
 */
export type WebauthnChallenge =
  Database["auth"]["Tables"]["webauthn_challenges"]["Row"];

/**
 * WebAuthn credential
 */
export type WebauthnCredential =
  Database["auth"]["Tables"]["webauthn_credentials"]["Row"];

/**
 * Profile (Modifying auth.users is considered bad practice, so additonal user data is stored here)
 */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * User location
 */
export type Location = Database["public"]["Tables"]["locations"]["Row"];

/**
 * Post
 */
export type Post = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  "id" | "poster_id" | "created_at" | "content" | "has_media"
> &
  Pick<
    DeepMandatory<Database["utilities"]["Views"]["cached_posts"]["Row"]>,
    "upvotes" | "downvotes"
  > & {
    distance: number;
  };

/**
 * Post vote
 */
export type PostVote = Database["public"]["Tables"]["post_votes"]["Row"];

/**
 * Post report
 */
export type PostReport = Database["public"]["Tables"]["post_reports"]["Row"];

/**
 * Comment
 */
export type Comment = Pick<
  Database["public"]["Tables"]["comments"]["Row"],
  "id" | "commenter_id" | "created_at" | "content"
> &
  Pick<
    DeepMandatory<Database["utilities"]["Views"]["cached_comments"]["Row"]>,
    "upvotes" | "downvotes"
  >;

/**
 * Comment vote
 */
export type CommentVote = Database["public"]["Tables"]["comment_votes"]["Row"];

/**
 * Comment report
 */
export type CommentReport =
  Database["public"]["Tables"]["comment_reports"]["Row"];
