/**
 * @file Blurhash component
 */

import {decode} from "blurhash";
import {useEffect, useRef} from "react";

import {MediaDimensions} from "~/lib/types";
import {
  BLURHASH_COMPONENT_X,
  BLURHASH_COMPONENT_Y,
  BLURHASH_PIXELS_PER_COMPONENT,
} from "~/lib/utils";

/**
 * Blurhash component props
 */
export interface BlurhashProps extends React.HTMLProps<HTMLCanvasElement> {
  /**
   * Blurhash string
   */
  hash: string;

  /**
   * Height of the blurhash
   */
  height: number;

  /**
   * Width of the blurhash
   */
  width: number;
}

/**
 * Blurhash component
 * @param props Props
 * @returns JSX
 */
export const Blurhash: React.FC<BlurhashProps> = ({
  hash,
  height,
  width,
  ...props
}) => {
  // Hooks
  const canvas = useRef<HTMLCanvasElement>(null);

  // Effects
  useEffect(() => {
    (async () => {
      if (canvas.current === null || height === 0 || width === 0) {
        return;
      }

      // Compute the scaled dimensions
      const scaledDimensions = {
        height: BLURHASH_COMPONENT_X * BLURHASH_PIXELS_PER_COMPONENT,
        width: BLURHASH_COMPONENT_Y * BLURHASH_PIXELS_PER_COMPONENT,
      } as MediaDimensions;

      // Get the context
      const context = canvas.current.getContext("2d")!;

      // Get the image data
      const imageData = context.createImageData(
        scaledDimensions.width,
        scaledDimensions.height,
      );

      // Decode the blurhash
      const pixels = decode(
        hash,
        scaledDimensions.width,
        scaledDimensions.height,
      );

      // Set the pixels
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);

      // Scale the canvas
      context.scale(
        width / scaledDimensions.width,
        height / scaledDimensions.height,
      );

      context.drawImage(canvas.current, 0, 0);
    })();
  }, [
    hash,
    width,
    height,
  ]);

  return <canvas {...props} height={height} width={width} ref={canvas} />;
};
