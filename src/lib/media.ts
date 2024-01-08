/**
 * @file Media utilities
 */

import {encode} from "blurhash";

import {
  MediaCategory,
  MediaCategoryElement,
  MediaDimensions,
} from "~/lib/types";

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
 * Create the appropriate element for the media
 * @param category Media category
 * @param dataURL Data URL
 * @returns Media element
 */
export const createMediaElement = async <T extends MediaCategory = any>(
  category: T,
  dataURL: string,
): Promise<MediaCategoryElement<T>> => {
  // Create the element
  let element: MediaCategoryElement<T>;

  switch (category) {
    case MediaCategory.IMAGE:
      element = document.createElement("img") as MediaCategoryElement<T>;
      break;

    case MediaCategory.VIDEO:
      element = document.createElement("video") as MediaCategoryElement<T>;
      break;

    default:
      throw new Error(`Invalid media category: ${category}`);
  }

  // Wait for the media to load
  await new Promise((resolve, reject) => {
    // Register event listeners
    element.addEventListener("error", reject);

    switch (category) {
      case MediaCategory.IMAGE:
        (element as HTMLImageElement).addEventListener("load", resolve, {
          once: true,
        });

        break;

      case MediaCategory.VIDEO:
        (element as HTMLVideoElement).currentTime = 1e-6;

        (element as HTMLVideoElement).addEventListener("loadeddata", resolve, {
          once: true,
        });

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
 * Get the dimensions of the media
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
 * Create a blurhash for the media
 * @param category Media category
 * @param element Media element
 * @param dimensions Media dimensions
 * @param componentX Number of X components
 * @param componentY Number of Y components
 * @returns Blurhash
 */
export const createBlurhash = async <T extends MediaCategory = any>(
  category: T,
  element: MediaCategoryElement<T>,
  dimensions: MediaDimensions,
  componentX: number,
  componentY: number,
) => {
  switch (category) {
    case MediaCategory.VIDEO:
      // Advance the video to the first frame
      await Promise.race([
        () => ((element as HTMLVideoElement).currentTime = 10),
        new Promise(resolve =>
          (element as HTMLVideoElement).addEventListener("", resolve, {
            once: true,
          }),
        ),
      ]);

      break;
  }

  // Create the canvas
  const canvas = document.createElement("canvas");
  canvas.height = dimensions.height;
  canvas.width = dimensions.width;

  // Get the context
  const context = canvas.getContext("2d")!;

  // Draw the media
  context.drawImage(element, 0, 0, dimensions.width, dimensions.height);

  // Scale down the canvas to speed up blurhash generation
  const scaledDimensions = {
    width: componentX * BLURHASH_PIXELS_PER_COMPONENT,
    height: componentY * BLURHASH_PIXELS_PER_COMPONENT,
  } as MediaDimensions;

  context.scale(
    scaledDimensions.width / dimensions.width,
    scaledDimensions.height / dimensions.height,
  );

  context.drawImage(canvas, 0, 0);

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
