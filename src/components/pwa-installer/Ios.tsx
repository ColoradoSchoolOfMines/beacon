/**
 * iOS PWA installer
 */

import * as React from "react";
import styles from "~/components/pwa-installer/Ios.module.css";

import ArrowClockwise from "~/assets/sf-symbols/arrow.clockwise.svg?react";
import Book from "~/assets/sf-symbols/book.svg?react";
import ChevronLeft from "~/assets/sf-symbols/chevron.left.svg?react";
import ChevronRight from "~/assets/sf-symbols/chevron.right.svg?react";
import SquareAndArrowUp from "~/assets/sf-symbols/square.and.arrow.up.svg?react";
import SquareOnSquare from "~/assets/sf-symbols/square.on.square.svg?react";
import TextFormatSize from "~/assets/sf-symbols/textformat.size.svg?react";

/**
 * Props for the iOS PWA installer
 */
interface IosProps {
  /**
   * Browser address
   */
  address: string;

  /**
   * Whether or not to render the dark variant
   */
  dark: boolean;
}

/**
 * iOS PWA installer
 * @returns JSX
 */
const Ios: React.FC<IosProps> = ({address}) => (
  <div className="flex flex-col items-stretch m-4">
    <p className="text-center text-4xl my-2">1. Click on the share button:</p>

    <div className="b-1 my-2 p-4 relative rounded-3xl">
      <div className="flex flex-col">
        <div className="p-8 mx-24 my-4 relative">
          <div className="flex flex-row h-full items-center w-full">
            <div className={`${styles.icon} ${styles["monochrome-icon"]}`}>
              <TextFormatSize />
            </div>

            <div className="flex-1 text-center">
              <p className="text-4xl">{address}</p>
            </div>

            <div className={`${styles.icon} ${styles["monochrome-icon"]}`}>
              <ArrowClockwise />
            </div>
          </div>

          <div className="-z-1 absolute bg-white bottom-0 dark:opacity-20 left-0 opacity-100 right-0 rounded-3xl top-0" />
        </div>

        <div className="flex flex-row items-center justify-between px-8 my-4 w-full">
          <div className={`${styles.icon} ${styles["colored-icon"]}`}>
            <ChevronLeft />
          </div>

          <div className={`${styles.icon} ${styles["colored-icon"]}`}>
            <ChevronRight />
          </div>

          <div className="relative">
            <div className={`${styles.icon} ${styles["colored-icon"]}`}>
              <SquareAndArrowUp />
            </div>

            <div className="-bottom-3 -left-8 -right-8 -top-3 -z-1 absolute bg-black dark:bg-white rounded-full" />
          </div>

          <div className={`${styles.icon} ${styles["colored-icon"]}`}>
            <Book />
          </div>

          <div className={`${styles.icon} ${styles["colored-icon"]}`}>
            <SquareOnSquare />
          </div>
        </div>
      </div>

      <div className="-z-2 absolute bg-neutral-200 bottom-0 dark:bg-inherit left-0 right-0 top-0" />
    </div>

    <p className="text-center text-4xl my-2">2. Click on Add to Home Screen:</p>

    <div className="b-1 my-2 p-4 relative rounded-3xl">
      <p>TODO</p>
    </div>
  </div>
);

export default Ios;
