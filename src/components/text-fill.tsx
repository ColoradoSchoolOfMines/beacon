/**
 * @file Text fill component
 */

import {FC, HTMLAttributes, ReactNode} from "react";
import {useMeasure} from "react-use";

/**
 * Sizer font size
 */
const SIZER_FONT_SIZE = 10;

/**
 * Text fill component props
 */
interface TextFillProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children
   */
  children: ReactNode;
}

/**
 * Text fill component
 * @param props Props
 * @returns JSX
 */
export const TextFill: FC<TextFillProps> = ({children, ...props}) => {
  // Hooks
  const [containerRef, {height: containerHeight, width: containerWidth}] =
    useMeasure<HTMLParagraphElement>();

  const [sizerRef, {height: sizerHeight, width: sizerWidth}] =
    useMeasure<HTMLParagraphElement>();

  // Variables
  let textFontSize = SIZER_FONT_SIZE;

  if (
    !Number.isNaN(containerHeight) &&
    !Number.isNaN(containerWidth) &&
    !Number.isNaN(sizerHeight) &&
    !Number.isNaN(sizerWidth)
  ) {
    textFontSize *= Math.min(
      containerHeight / sizerHeight,
      containerWidth / sizerWidth,
    );
  }

  return (
    <div
      {...props}
      className={`flex flex-row h-full items-center justify-center relative w-full ${
        props.className ?? ""
      }`}
      ref={containerRef}
    >
      <p
        className="!m-0 !p-0 absolute invisible text-nowrap whitespace-pre"
        style={{
          fontSize: `${SIZER_FONT_SIZE}px`,
        }}
        ref={sizerRef}
      >
        {children}
      </p>
      <p
        className="!m-0 !p-0 text-nowrap whitespace-pre"
        style={{
          fontSize: `${textFontSize}px`,
        }}
      >
        {children}
      </p>
    </div>
  );
};
