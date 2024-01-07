/**
 * @file Miscellaneous utilities
 */

import {User} from "@supabase/supabase-js";
import {encode} from "blurhash";

import {
  MediaCategory,
  MediaCategoryElement,
  MediaDimensions,
  RequiredAuthState,
} from "~/lib/types";

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
 * Minimum media dimension
 */
export const MIN_MEDIA_DIMENSION = 128;

/**
 * Maximum media dimension
 * @see https://github.com/supabase/imgproxy/blob/c15dbefb4ba85ac6ca807949073707ea7fceb270/config/config.go#L235 (Must be smaller than the square root of this)
 */
export const MAX_MEDIA_DIMENSION = 4096;

/**
 * Default blurhash X component count
 */
export const BLURHASH_COMPONENT_X = 4;

/**
 * Default blurhash Y component count
 */
export const BLURHASH_COMPONENT_Y = 5;

/**
 * Default blurhash pixels per component
 */
export const BLURHASH_PIXELS_PER_COMPONENT = 8;

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
 * Generate the appropriate element for the media blob
 * @param raw Raw media blob
 * @returns Media element
 */
export const generateMediaElement = async <T extends MediaCategory = any>(
  raw: Blob,
): Promise<MediaCategoryElement<T>> => {
  // Create a data URL for the blob
  const dataURL = await createDataURL(raw);

  // Get the category of the media
  const category = getCategory(raw.type);

  if (category === undefined) {
    throw new Error(`Invalid media category for MIME type: ${raw.type}`);
  }

  // Create the element
  let element: MediaCategoryElement<T>;

  switch (category) {
    case MediaCategory.IMAGE:
      element = document.createElement("img") as MediaCategoryElement<T>;
      break;

    case MediaCategory.VIDEO:
      element = document.createElement("video") as MediaCategoryElement<T>;
      break;
  }

  // Wait for the media to load
  await new Promise((resolve, reject) => {
    // Register event listeners
    element.addEventListener("error", reject);

    switch (category) {
      case MediaCategory.IMAGE:
        element.addEventListener("load", resolve);
        break;

      case MediaCategory.VIDEO:
        element.addEventListener("loadeddata", resolve);
        break;
    }

    // Set a timeout
    setTimeout(() => reject("Timed out waiting for media to load"), 2000);

    // Load the media
    element.src = dataURL;
  });

  return element;
};

/**
 * Get the dimensions of the media blob
 * @param category Media category
 * @param element Media element
 * @returns Media dimensions
 */
export const getMediaDimensions = <T extends MediaCategory = any>(
  category: T,
  element: MediaCategoryElement<T>,
) => {
  // Get the dimensions
  switch (category) {
    case MediaCategory.IMAGE:
      return {
        width: (element as HTMLImageElement).naturalWidth,
        height: (element as HTMLImageElement).naturalHeight,
      } as MediaDimensions;

    case MediaCategory.VIDEO:
      return {
        width: (element as HTMLVideoElement).videoWidth,
        height: (element as HTMLVideoElement).videoHeight,
      } as MediaDimensions;

    default:
      throw new Error(`Invalid media category: ${category}`);
  }
};

/**
 * Generate a blurhash for the media blob
 * @param element Media element
 * @param dimensions Media dimensions
 * @param componentX Number of X components
 * @param componentY Number of Y components
 * @returns Blurhash
 */
export const generateBlurhash = async <T extends MediaCategory = any>(
  element: MediaCategoryElement<T>,
  dimensions: MediaDimensions,
  componentX: number,
  componentY: number,
) => {
  // Create the canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  canvas.height = dimensions.height;
  canvas.width = dimensions.width;

  // Draw the media
  context.drawImage(element, 0, 0);

  // Scale down the canvas to speed up blurhash generation
  const scaledDimensions = {
    width: componentX * BLURHASH_PIXELS_PER_COMPONENT,
    height: componentY * BLURHASH_PIXELS_PER_COMPONENT,
  } as MediaDimensions;

  context.scale(
    scaledDimensions.width / dimensions.width,
    scaledDimensions.height / dimensions.height,
  );

  // Get the image data
  const imageData = context.getImageData(
    0,
    0,
    scaledDimensions.width,
    scaledDimensions.height,
  );

  // Generate the blurhash
  const hash = encode(
    imageData.data,
    scaledDimensions.width,
    scaledDimensions.height,
    componentX,
    componentY,
  );

  return hash;
};
