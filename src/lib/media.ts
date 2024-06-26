/**
 * @file Media utilities
 */

import {encode} from "blurhash";
import {flatten} from "lodash-es";

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
 * @see https://github.com/imgproxy/imgproxy/blob/8c22d7b1532e848e30dc3cb81ce8993452589562/config/config.go#L235C2-L235C18 (Must be no more than the square root of this)
 */
export const MAX_MEDIA_DIMENSION = 4096;

/**
 * Maximum media blob size
 */
export const MAX_MEDIA_SIZE = 4194304; // 4 MiB

/**
 * Preferred image MIME type
 */
export const PREFERRED_IMAGE_MIME_TYPE = "image/webp";

/**
 * Preferred image quality (0-1)
 */
export const PREFERRED_IMAGE_QUALITY = 0.95;

/**
 * Blurhash X component count
 */
export const BLURHASH_COMPONENT_X = 4;

/**
 * Blurhash Y component count
 */
export const BLURHASH_COMPONENT_Y = 5;

/**
 * Blurhash pixels per component
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
 * Capture media from the user's device
 * @param newCapture Whether to capture new media (i.e.: take a photo or record a video) or select existing media (i.e.: upload an existing photo or video)
 * @param category Media category
 * @returns Media file
 */
export const captureMedia = async <T extends boolean>(
  newCapture: T,
  category: T extends true ? MediaCategory : MediaCategory | undefined,
) => {
  // Create the input element
  const input = document.createElement("input");
  input.type = "file";

  input.accept =
    newCapture && category !== undefined
      ? CATEGORIZED_MEDIA_MIME_TYPES[category].join(",")
      : flatten(Object.values(CATEGORIZED_MEDIA_MIME_TYPES)).join(",");

  if (newCapture) {
    input.capture = "environment";
  }

  // Wait for the user to select media
  await new Promise((resolve, reject) => {
    // Register event listeners
    input.addEventListener("change", resolve, {once: true});
    input.addEventListener("error", reject, {once: true});

    // Trigger the input
    input.click();
  });

  // Get the media file
  const file = input.files?.[0];

  if (file === undefined) {
    throw new Error("No media file selected!");
  }

  // Clean up
  input.remove();

  return file;
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
 * Create a canvas for the media
 * @param element Media element
 * @param dimensions Media dimensions
 * @returns Media canvas
 */
export const createMediaCanvas = <T extends MediaCategory = any>(
  element: MediaCategoryElement<T>,
  dimensions: MediaDimensions,
) => {
  // Create the canvas
  const canvas = document.createElement("canvas");
  canvas.height = dimensions.height;
  canvas.width = dimensions.width;
  const context = canvas.getContext("2d")!;

  // Draw the media
  context.drawImage(element, 0, 0, dimensions.width, dimensions.height);

  return canvas;
};

/**
 * Scale the canvas to the specified dimensions
 * @param canvas Original canvas
 * @param dimensions New dimensions
 * @returns Scaled canvas
 */
export const scaleCanvas = (
  canvas: HTMLCanvasElement,
  dimensions: MediaDimensions,
) => {
  // Create a new canvas
  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.height = dimensions.height;
  scaledCanvas.width = dimensions.width;
  const context = scaledCanvas.getContext("2d")!;

  // Scale the canvas
  context.drawImage(canvas, 0, 0, dimensions.width, dimensions.height);

  return scaledCanvas;
};

/**
 * Create a blurhash for the media
 * @param canvas Media canvas
 * @param dimensions Media dimensions
 * @param componentX Number of X components
 * @param componentY Number of Y components
 * @returns Blurhash
 */
export const createBlurhash = (
  canvas: HTMLCanvasElement,
  componentX: number,
  componentY: number,
) => {
  // Scale down the canvas to speed up blurhash generation
  const scaledDimensions = {
    width: componentX * BLURHASH_PIXELS_PER_COMPONENT,
    height: componentY * BLURHASH_PIXELS_PER_COMPONENT,
  } as MediaDimensions;

  const scaledCanvas = scaleCanvas(canvas, scaledDimensions);
  const scaledCanvasContext = scaledCanvas.getContext("2d")!;

  // Get the image data
  const imageData = scaledCanvasContext.getImageData(
    0,
    0,
    scaledDimensions.width,
    scaledDimensions.height,
  );

  // Clean up
  scaledCanvas.remove();

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

/**
 * Export the media
 * @param canvas Media canvas
 * @param mimeType MIME type
 * @param quality Quality (0-1)
 * @returns Media blob
 */
export const exportMedia = async (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob === null ? reject("Canvas blob is null!") : resolve(blob)),
      mimeType,
      quality,
    );
  });
};
