/**
 * @file Miscellaneous utilities
 */

import {User} from "@supabase/supabase-js";

import {MediaCategory, RequiredAuthState} from "~/lib/types";

/**
 * Minimum media dimension
 */
export const MIN_MEDIA_DIMENSION = 128;

/**
 * Maximum media dimension
 * @see https://github.com/supabase/imgproxy/blob/c15dbefb4ba85ac6ca807949073707ea7fceb270/config/config.go#L235 (Must be smaller than the square root of this)
 */
export const MAX_MEDIA_DIMENSION = 4096;

/**
 * Allowed media MIME types
 */
export const CATEGORIZED_MEDIA_MIME_TYPES = {
  [MediaCategory.IMAGE]: [
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ],
  [MediaCategory.VIDEO]: [
    "video/mp4",
    "video/mpeg",
    "video/webm",
  ],
} as Record<MediaCategory, string[]>;

/**
 * Get the media category for the MIME type
 * @param mimeType MIME type
 * @returns Media category or undefined if the MIME type is not allowed
 */
export const getCategory = (mimeType: string): MediaCategory | undefined => {
  for (const [category, mimeTypes] of Object.entries(
    CATEGORIZED_MEDIA_MIME_TYPES,
  )) {
    if (mimeTypes.includes(mimeType)) {
      return category as MediaCategory;
    }
  }

  return undefined;
};

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

/**
 * Create a data URL for the blob
 * @param raw Raw blob
 * @returns Data URL
 */
export const createDataURL = async (raw: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(raw);

  await new Promise(resolve =>
    reader.addEventListener("load", resolve, {
      once: true,
    }),
  );

  return reader.result as string;
};

/**
 * Get the dimensions of the media blob
 * @param raw Raw blob
 * @returns Dimensions
 */
export const getMediaDimensions = async (raw: Blob) => {
  // Create a data URL for the blob
  const dataURL = await createDataURL(raw);

  // Get the category of the media
  const category = getCategory(raw.type);

  if (category === undefined) {
    throw new Error(`Invalid media category for MIME type: ${raw.type}`);
  }

  // Create a container element
  let container: HTMLImageElement | HTMLVideoElement;

  switch (category) {
    case MediaCategory.IMAGE:
      container = document.createElement("img");
      break;

    case MediaCategory.VIDEO:
      container = document.createElement("video");
      break;
  }

  // Wait for the media to load
  await new Promise((resolve, reject) => {
    // Register event listeners
    container.addEventListener("error", reject);

    switch (category) {
      case MediaCategory.IMAGE:
        container.addEventListener("load", resolve);
        break;

      case MediaCategory.VIDEO:
        container.addEventListener("loadeddata", resolve);
        break;
    }

    // Set a timeout
    setTimeout(() => reject("Timed out waiting for media to load"), 2000);

    // Load the media
    container.src = dataURL;
  });

  // Get the dimensions
  switch (category) {
    case MediaCategory.IMAGE:
      return {
        width: (container as HTMLImageElement).naturalWidth,
        height: (container as HTMLImageElement).naturalHeight,
      };

    case MediaCategory.VIDEO:
      return {
        width: (container as HTMLVideoElement).videoWidth,
        height: (container as HTMLVideoElement).videoHeight,
      };
  }
};
