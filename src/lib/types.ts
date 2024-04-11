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
 * Prefix all keys of `T` with `P`
 * @param T Type
 * @param P Prefix
 */
export type PrefixKeys<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

/**
 * Votable abstract entity
 */
export interface VotableEntity {
  /**
   * Unique entity identifier
   */
  id: string;

  /**
   * Whether or not the current user has upvoted the entity (`true`), downvoted the entity (`false`), or not voted on the entity (`null`)
   */
  upvote: boolean | null;

  /**
   * The current number of upvotes on the entity
   */
  upvotes: number;

  /**
   * The current number of downvotes on the entity
   */
  downvotes: number;
}

/**
 * Global information message metadata
 */
export interface GlobalMessageMetadata {
  /**
   * Unique message identifier
   */
  symbol: symbol;

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
 * Measurement systems
 */
export enum MeasurementSystem {
  /**
   * Metric
   */
  METRIC = "metric",

  /**
   * Imperial
   */
  IMPERIAL = "imperial",
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
 * Media category
 */
export enum MediaCategory {
  /**
   * Image
   */
  IMAGE = "image",

  /**
   * Video
   */
  VIDEO = "video",
}

/**
 * Media dimensions
 */
export interface MediaDimensions {
  /**
   * Media height (In pixels)
   */
  height: number;

  /**
   * Media width (In pixels)
   */
  width: number;
}

/**
 * Media category element
 * @param T Media category
 */
export type MediaCategoryElement<T extends MediaCategory> =
  T extends MediaCategory.IMAGE ? HTMLImageElement : HTMLVideoElement;

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
 * @param T Whether or not the post has media
 */
export type Post<T extends boolean = boolean> = {
  id: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["id"]
  >;
  poster_id: Database["public"]["Views"]["personalized_posts"]["Row"]["poster_id"];
  created_at: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["created_at"]
  >;
  content: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["content"]
  >;
  has_media: T;
  views: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["views"]
  >;
  upvotes: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["upvotes"]
  >;
  downvotes: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["downvotes"]
  >;
  comments: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["comments"]
  >;
  distance: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["distance"]
  >;
  rank: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["rank"]
  >;

  is_mine: NonNullable<
    Database["public"]["Views"]["personalized_posts"]["Row"]["is_mine"]
  >;
  poster_color: Database["public"]["Views"]["personalized_posts"]["Row"]["poster_color"];
  poster_emoji: Database["public"]["Views"]["personalized_posts"]["Row"]["poster_emoji"];

  upvote: Database["public"]["Views"]["personalized_posts"]["Row"]["upvote"];
} & (T extends true
  ? {
      blur_hash: NonNullable<
        Database["public"]["Views"]["personalized_posts"]["Row"]["blur_hash"]
      >;
      aspect_ratio: NonNullable<
        Database["public"]["Views"]["personalized_posts"]["Row"]["aspect_ratio"]
      >;
    }
  : {});

/**
 * Post creation data
 */
export interface PostCreate {
  /**
   * Post content
   */
  content: string;

  /**
   * Post media
   */
  media?: File;

  /**
   * Whether or not the post is anonymous
   */
  anonymous: boolean;

  /**
   * Post radius (in meters)
   */
  radius: number;
}

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
export interface Comment {
  id: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["id"]
  >;
  commenter_id: Database["public"]["Views"]["personalized_comments"]["Row"]["commenter_id"];
  post_id: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["post_id"]
  >;
  parent_id: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["parent_id"]
  >;
  created_at: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["created_at"]
  >;
  content: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["content"]
  >;
  upvotes: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["upvotes"]
  >;
  downvotes: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["downvotes"]
  >;
  rank: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["rank"]
  >;

  is_mine: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["is_mine"]
  >;
  commenter_color: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["commenter_color"]
  >;
  commenter_emoji: NonNullable<
    Database["public"]["Views"]["personalized_comments"]["Row"]["commenter_emoji"]
  >;

  upvote: Database["public"]["Views"]["personalized_comments"]["Row"]["upvote"];
}

/**
 * Comment vote
 */
export type CommentVote = Database["public"]["Tables"]["comment_votes"]["Row"];

/**
 * Comment report
 */
export type CommentReport =
  Database["public"]["Tables"]["comment_reports"]["Row"];
