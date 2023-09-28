/**
 * @file iOS PWA installer
 */

import * as React from "react";

import ArrowClockwise from "~/assets/sf-symbols/arrow.clockwise.svg?react";
import Book from "~/assets/sf-symbols/book.svg?react";
import ChevronLeft from "~/assets/sf-symbols/chevron.left.svg?react";
import ChevronRight from "~/assets/sf-symbols/chevron.right.svg?react";
import DocOnDoc from "~/assets/sf-symbols/doc.on.doc.svg?react";
import DocTextMagnifyingGlass from "~/assets/sf-symbols/doc.text.magnifyingglass.svg?react";
import Eyeglasses from "~/assets/sf-symbols/eyeglasses.svg?react";
import PencilTipCropCircle from "~/assets/sf-symbols/pencil.tip.crop.circle.svg?react";
import PlusApp from "~/assets/sf-symbols/plus.app.svg?react";
import Printer from "~/assets/sf-symbols/printer.svg?react";
import SquareAndArrowUp from "~/assets/sf-symbols/square.and.arrow.up.svg?react";
import SquareOnSquare from "~/assets/sf-symbols/square.on.square.svg?react";
import Star from "~/assets/sf-symbols/star.svg?react";
import TextFormatSize from "~/assets/sf-symbols/textformat.size.svg?react";
import styles from "~/components/pwa-installer/Ios.module.css";

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
export const Ios: React.FC<IosProps> = ({address}) => (
  <div className="flex flex-col items-stretch m-4">
    <p className="text-3xl mb-2">1. Click the share button:</p>

    <div className="b-1 b-black dark:b-white py-2 relative rounded-xl">
      <div className="flex flex-col">
        <div className="h-12 h-fit mx-8 my-2 relative">
          <div className="flex flex-row h-full items-center p-4 w-full">
            <div className={`h-5 w-5 ${styles.icon} ${styles.monochromeIcon}`}>
              <TextFormatSize />
            </div>

            <div className="flex-1 text-center">
              <p className="text-lg">{address}</p>
            </div>

            <div className={`h-5 w-5 ${styles.icon} ${styles.monochromeIcon}`}>
              <ArrowClockwise />
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgHigh}`}
          />
        </div>

        <div className="flex flex-row items-center justify-between mb-2 p-4 w-full">
          <div className={`h-5 w-5 ${styles.icon} ${styles.blueIcon}`}>
            <ChevronLeft />
          </div>

          <div className={`h-5 w-5 ${styles.icon} ${styles.blueIcon}`}>
            <ChevronRight />
          </div>

          <div className="relative">
            <div className={`h-5 w-5 ${styles.icon} ${styles.blueIcon}`}>
              <SquareAndArrowUp />
            </div>

            <div className="-bottom-4 -left-4 -right-4 -top-4 -z-1 absolute b-4 b-red-500 rounded-xl" />
          </div>

          <div className={`h-5 w-5 ${styles.icon} ${styles.blueIcon}`}>
            <Book />
          </div>

          <div className={`h-5 w-5 ${styles.icon} ${styles.blueIcon}`}>
            <SquareOnSquare />
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgLow}`}
      />
    </div>

    <p className="text-3xl mt-6 mb-2">
      2. Click <q>Add to Home Screen</q>:
    </p>

    <div className="b-1 b-black dark:b-white b-1 py-2 relative rounded-xl">
      <div className="flex flex-col">
        <div className="h-12 h-fit mx-8 my-1 relative">
          <div className="flex flex-row h-full items-center p-4 w-full">
            <p className="flex-1">Copy</p>

            <div className={`h-6 w-6 ${styles.icon} ${styles.monochromeIcon}`}>
              <DocOnDoc />
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgHigh}`}
          />
        </div>

        <div className="h-12 h-fit mx-8 my-1 relative">
          <div className="flex flex-col">
            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Add to Reading List</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <Eyeglasses />
              </div>
            </div>

            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Add Bookmark</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <Book />
              </div>
            </div>

            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Add to Favorites</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <Star />
              </div>
            </div>

            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Find on Page</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <DocTextMagnifyingGlass />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-row h-full items-center p-4 w-full">
                <p className="flex-1">Add to Home Screen</p>

                <div
                  className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
                >
                  <PlusApp />
                </div>
              </div>

              <div className="-z-1 absolute bottom-0 left-0 b-4 b-red-500 right-0 rounded-xl top-0" />
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgHigh}`}
          />
        </div>

        <div className="h-12 h-fit mx-8 my-1 relative">
          <div className="flex flex-col">
            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Markup</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <PencilTipCropCircle />
              </div>
            </div>

            <div className="flex flex-row h-full items-center p-4 w-full">
              <p className="flex-1">Print</p>

              <div
                className={`h-6 w-8 ${styles.icon} ${styles.monochromeIcon}`}
              >
                <Printer />
              </div>
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgHigh}`}
          />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgLow}`}
      />
    </div>

    <p className="text-3xl mt-6 mb-2">
      3. Click <q>Add</q>:
    </p>

    <div className="b-1 b-black dark:b-white mb-2 py-2 relative rounded-xl">
      <div className="flex flex-row h-full items-center p-4 w-full">
        <p className={styles.blueText}>Cancel</p>
        <p className="flex-1 font-bold text-center">Add to Home Screen</p>

        <div className="relative">
          <p className={styles.blueText}>Add</p>

          <div className="-z-1 absolute -bottom-4 -left-4 b-4 b-red-500 -right-4 rounded-xl -top-4" />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 rounded-xl top-0 ${styles.bgHigh}`}
      />
    </div>
  </div>
);
