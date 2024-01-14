/**
 * @file Blurhash component
 */

import {decode} from "blurhash";
import {FC, HTMLProps, useEffect, useRef, useState} from "react";

import {
  BLURHASH_COMPONENT_X,
  BLURHASH_COMPONENT_Y,
  BLURHASH_PIXELS_PER_COMPONENT,
} from "~/lib/media";
import {useSettingsStore} from "~/lib/stores/settings";
import {MediaDimensions, Theme} from "~/lib/types";

/**
 * Blurhash component props
 */
export interface BlurhashProps extends HTMLProps<HTMLCanvasElement> {
  /**
   * Ambient effect
   */
  ambient: boolean;

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
export const Blurhash: FC<BlurhashProps> = ({
  hash,
  height,
  width,
  ambient,
  ...props
}) => {
  // Hooks
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<Uint8ClampedArray | undefined>();
  const [avg, setAvg] = useState<string | undefined>();

  const theme = useSettingsStore(state => state.theme);

  // Constants
  const scaledDimensions = {
    height: BLURHASH_COMPONENT_X * BLURHASH_PIXELS_PER_COMPONENT,
    width: BLURHASH_COMPONENT_Y * BLURHASH_PIXELS_PER_COMPONENT,
  } as MediaDimensions;

  // Effects
  useEffect(() => {
    // Decode the blurhash
    setPixels(decode(hash, scaledDimensions.width, scaledDimensions.height));
  }, [hash]);

  useEffect(() => {
    if (ambient && pixels !== undefined) {
      // Compute the average color of the bottom row
      let r = 0;
      let g = 0;
      let b = 0;

      for (let col = 0; col < scaledDimensions.width; col++) {
        const index =
          4 * (scaledDimensions.height - 1) * scaledDimensions.width;

        r += pixels[index]!;
        g += pixels[index + 1]!;
        b += pixels[index + 2]!;
      }

      r /= scaledDimensions.width;
      g /= scaledDimensions.width;
      b /= scaledDimensions.width;

      // Convert to hex
      const hex = `#${[
        r,
        g,
        b,
      ]
        .map(component => component.toString(16).padStart(2, "0"))
        .join("")}`;

      setAvg(hex);
    } else {
      setAvg(undefined);
    }
  }, [ambient, pixels]);

  useEffect(() => {
    (async () => {
      if (
        canvas.current === null ||
        height === 0 ||
        width === 0 ||
        pixels === undefined
      ) {
        return;
      }

      // Get the context
      const context = canvas.current.getContext("2d")!;

      // Get the image data
      const imageData = context.createImageData(
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

  return (
    <canvas
      {...props}
      style={{
        ...props.style,
        ...(avg === undefined
          ? {}
          : {
              boxShadow: `0 0 300px ${theme === Theme.DARK ? 5 : 50}px ${avg}`,
            }),
      }}
      height={height}
      width={width}
      ref={canvas}
    />
  );
};
