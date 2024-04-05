/**
 * @file Swipeable item component
 */

import {
  IonItemOptions,
  IonItemSliding,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import {FC, ReactNode, useRef} from "react";

import {usePersistentStore} from "~/lib/stores/persistent";

/**
 * Swipeable item component props
 */
interface SwipeableItemProps {
  /**
   * Item content
   */
  children: ReactNode;

  /**
   * Start option (Left side)
   */
  startOption?: ReactNode;

  /**
   * End option (Right side)
   */
  endOption?: ReactNode;

  /**
   * Start action
   */
  startAction?: () => void | Promise<void>;

  /**
   * End action
   */
  endAction?: () => void | Promise<void>;
}

/**
 * Swipeable item component
 * @param props Swipeable item component props
 * @returns JSX
 */
export const SwipeableItem: FC<SwipeableItemProps> = ({
  children,
  startOption,
  endOption,
  startAction,
  endAction,
}) => {
  // Hooks
  const previousRatio = useRef<number>();

  const useSlidingActions = usePersistentStore(
    state => state.useSlidingActions,
  );

  // Methods
  /**
   * Item sliding swipe event handler
   * @param event Item sliding custom event
   */
  const onItemSlidingSwipe = async (event: ItemSlidingCustomEvent) => {
    if (!useSlidingActions) {
      return;
    }

    // Cast the detail
    const detail = event.detail as {
      amount: number;
      ratio: number;
    };

    // Upvote (Swiped left)
    if (
      previousRatio.current !== undefined &&
      detail.ratio <= -1 &&
      previousRatio.current < detail.ratio
    ) {
      await startAction?.();
      await event.target.closeOpened();
    }
    // Downvote (Swiped right)
    else if (
      previousRatio.current !== undefined &&
      detail.ratio >= 1 &&
      previousRatio.current > detail.ratio
    ) {
      await endAction?.();
      await event.target.closeOpened();
    }

    // Store the ratio
    previousRatio.current = detail.ratio;
  };

  return (
    <IonItemSliding onIonDrag={onItemSlidingSwipe}>
      {useSlidingActions && (
        <IonItemOptions side="start">{startOption}</IonItemOptions>
      )}
      {children}
      {useSlidingActions && (
        <IonItemOptions side="end">{endOption}</IonItemOptions>
      )}
    </IonItemSliding>
  );
};
