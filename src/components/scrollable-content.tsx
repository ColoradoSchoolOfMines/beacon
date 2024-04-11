/**
 * @file Scrollable content component
 */

import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  RefresherEventDetail,
} from "@ionic/react";
import {ReactNode, useEffect, useRef, useState} from "react";
import {useMeasure} from "react-use";
import {VList, VListHandle} from "virtua";

import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {KeysOfType} from "~/lib/types";

/**
 * Scrollable content component props
 * @param T Content item type
 */
interface ScrollableContentProps<T extends object> {
  /**
   * Singular content item name (e.g.: `comment`)
   */
  contentItemName: string;

  /**
   * Content items
   */
  contentItems: T[];

  /**
   * Set content items
   */
  setContentItems: (contentItems: T[]) => void;

  /**
   * Content item unique identifier key
   */
  contentItemIDKey: KeysOfType<T, string>;

  /**
   * Content item rank key
   */
  contentItemRankKey: KeysOfType<T, number>;

  /**
   * Content item viewed event handler
   * @param contentItem Content item
   */
  onContentItemViewed?: (contentItem: T) => void;

  /**
   * Content item renderer
   * @param item Content item
   * @param index Content item index
   * @param onLoad Content item load event handler
   * @returns JSX
   */
  contentItemRenderer: (
    item: T,
    index: number,
    onLoad: () => void,
  ) => ReactNode;

  /**
   * Fetch content
   * @param limit Limit
   * @param cutoffRank Cutoff rank or undefined for no cutoff
   * @returns Content items
   */
  fetchContent: (limit: number, cutoffRank?: number) => T[] | Promise<T[]>;

  /**
   * Refresh event handler
   */
  onRefresh?: () => void | Promise<void>;

  /**
   * Header slot (Inline with content items)
   */
  header?: ReactNode;

  /**
   * Content range limit (Maximum number of content items to fetch at a time)
   */
  contentRangeLimit?: number;

  /**
   * Prefetch time coefficient (Multiplied by the estimated time to scroll to the bottom to determine when to prefetch more content)
   */
  prefetchTimeCoefficient?: number;

  /**
   * Maximum number of scroll metadatas to keep (Fewer metadatas means less accurate velocity calculations but less memory usage)
   */
  maximumScrollMetadatas?: number;
}

/**
 * Content index range (start, end)
 */
type ContentRange = [number, number];

/**
 * Scroll metadata
 */
interface ScrollMetadata {
  /**
   * Scroll offset
   */
  offset: number;

  /**
   * Timestamp
   */
  timestamp: Date;
}

/**
 * Scrollable content component
 * @param props Props
 * @returns JSX
 */
export const ScrollableContent = <T extends object>({
  contentItemName,
  contentItems,
  setContentItems,
  contentItemIDKey,
  contentItemRankKey,
  onContentItemViewed,
  contentItemRenderer,
  fetchContent: baseFetchContent,
  onRefresh,
  header,
  contentRangeLimit = 9,
  prefetchTimeCoefficient = 1.2,
  maximumScrollMetadatas = 10,
}: ScrollableContentProps<T>) => {
  // Constants
  /**
   * Default content index range
   */
  const defaultContentRange: ContentRange = [0, contentRangeLimit];

  // Hooks
  const [outOfContent, setOutOfContent] = useState(false);
  const [fetching, setFetching] = useState(false);

  const rankCutoff = useRef<number | undefined>(undefined);
  const visibleContentRange = useRef<ContentRange>([...defaultContentRange]);
  const fetchLatency = useRef(50);

  const virtualScroller = useRef<VListHandle>(null);
  const previousScrollMetadatas = useRef<ScrollMetadata[]>([]);
  const loadedContentItems = useRef(new Set<string>());
  const viewedContentItems = useRef(new Set<string>());

  const registerRefreshContent = useEphemeralUIStore(
    state => state.registerRefreshContent,
  );

  const unregisterRefreshContent = useEphemeralUIStore(
    state => state.unregisterRefreshContent,
  );

  const [contentRef, {height}] = useMeasure<HTMLIonContentElement>();

  // Effects
  useEffect(() => {
    // Fetch initial content items (non-blocking)
    fetchContent(contentRangeLimit, true);

    // Register the refresh content function
    registerRefreshContent(refreshContent);

    return () => {
      // Unregister the refresh content function
      unregisterRefreshContent(refreshContent);
    };
  }, []);

  // Methods
  /**
   * Fetch content
   * @param limit Limit
   * @param reset Whether or not to reset the content items
   */
  const fetchContent = async (limit: number, reset: boolean) => {
    // Enter critical section
    if (fetching) {
      return;
    }

    setFetching(true);

    // Record the rank cutoff
    if (reset) {
      rankCutoff.current = undefined;
    }

    // Record the start time
    const startTime = Date.now();

    // Fetch the content
    const items = await baseFetchContent(limit, rankCutoff.current);

    // Record the end time
    const endTime = Date.now();

    // Update the state
    setContentItems(reset ? items : contentItems.concat(items));
    setOutOfContent(items.length < contentRangeLimit);

    if (items.length > 0) {
      rankCutoff.current = items.at(-1)![contentItemRankKey] as number;
    }

    fetchLatency.current = endTime - startTime;

    // Exit critical section
    setFetching(false);
  };

  /**
   * Refresh content, discarding stale content
   */
  const refreshContent = async () => {
    // Fetch content
    await fetchContent(contentRangeLimit, true);

    // Reset scroll position
    virtualScroller.current?.scrollTo(0);
  };

  /**
   * Update the viewed content items in the visible range
   */
  const updatedViewedContentItems = async () => {
    // Check if all content items in range have been loaded
    const allLoaded = contentItems
      .slice(visibleContentRange.current[0], visibleContentRange.current[1])
      .every(contentItem =>
        loadedContentItems.current.has(contentItem[contentItemIDKey] as string),
      );

    // Mark all content items in range as viewed
    if (allLoaded) {
      const results = [];

      for (
        let i = visibleContentRange.current[0];
        i < Math.min(visibleContentRange.current[1], contentItems.length);
        i++
      ) {
        const contentItem = contentItems[i]!;

        // Skip if the content item has already been viewed
        if (
          viewedContentItems.current.has(
            contentItem[contentItemIDKey] as string,
          )
        ) {
          continue;
        }

        // Update the viewed content items
        viewedContentItems.current.add(contentItem[contentItemIDKey] as string);

        results.push(
          (async () => {
            // Call the content item viewed event handler
            await onContentItemViewed?.(contentItem);
          })(),
        );
      }

      await Promise.all(results);
    }
  };

  /**
   * Refresher refresh event handler
   * @param event Refresher refresh event
   */
  const onRefresherRefresh = async (
    event: CustomEvent<RefresherEventDetail>,
  ) => {
    // Refresh content
    await refreshContent();

    // Call the refresh event handler
    await onRefresh?.();

    // Complete the refresher
    event.detail.complete();
  };

  /**
   * Scroll event handler
   * @param offset Offset
   */
  const onScroll = async (offset: number) => {
    if (virtualScroller.current === null) {
      return;
    }

    // Update the previous scroll metadata
    previousScrollMetadatas.current.push({
      offset,
      timestamp: new Date(),
    });

    if (previousScrollMetadatas.current.length > maximumScrollMetadatas) {
      previousScrollMetadatas.current = previousScrollMetadatas.current.slice(
        -maximumScrollMetadatas,
      );
    }

    // Calculate the remaining scroll distance (In pixels)
    const remainingDistance =
      virtualScroller.current.scrollSize -
      virtualScroller.current.viewportSize -
      offset;

    // Calculate the velocity (In pixels/millisecond)
    let velocity = 0;

    for (let i = 1; i < previousScrollMetadatas.current.length; i++) {
      const a = previousScrollMetadatas.current[i - 1]!;
      const b = previousScrollMetadatas.current[i]!;

      velocity +=
        (b.offset - a.offset) / (b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Calculate the estimated time to scroll to the bottom (In milliseconds)
    const remainingTime = remainingDistance / velocity;

    if (
      !outOfContent &&
      remainingTime > 0 &&
      prefetchTimeCoefficient * remainingTime <= fetchLatency.current
    ) {
      // Fetch content
      await fetchContent(contentRangeLimit, false);
    }
  };

  /**
   * Range change event handler
   * @param start Start index
   * @param end End index
   */
  const onRangeChange = async (start: number, end: number) => {
    // Update the visible content range
    visibleContentRange.current[0] = start;
    visibleContentRange.current[1] = end;

    // Update the viewed content items in the visible range
    await updatedViewedContentItems();
  };

  /**
   * Content item load event handler
   * @param contentItem Content item
   */
  const onContentItemLoaded = async (contentItem: T) => {
    // Update the loaded content items
    loadedContentItems.current.add(contentItem[contentItemIDKey] as string);

    // Update the viewed content items in the visible range
    await updatedViewedContentItems();
  };

  return (
    <IonContent scrollY={false} ref={contentRef}>
      <IonRefresher onIonRefresh={onRefresherRefresh} slot="fixed">
        <IonRefresherContent />
      </IonRefresher>

      <div className="flex flex-col h-full w-full">
        {contentItems.length > 0 ? (
          <VList
            className="ion-content-scroll-host overflow-auto"
            onScroll={onScroll}
            onRangeChange={onRangeChange}
            style={{
              height,
            }}
            ref={virtualScroller}
          >
            {header !== undefined && header}

            {contentItems.map((contentItem, index) =>
              contentItemRenderer(contentItem, index, () =>
                onContentItemLoaded(contentItem),
              ),
            )}

            {contentItems.length > 0 && outOfContent && (
              <IonItem lines="none">
                <p className="mt-6 mb-8 text-center text-xl w-full">
                  No more {contentItemName}s to see 😢
                  <br />
                  <button
                    aria-label={`Refresh all ${contentItemName}s`}
                    onClick={refreshContent}
                  >
                    <u>Refresh</u>
                  </button>{" "}
                  the page to see new {contentItemName}s!
                </p>
              </IonItem>
            )}

            {contentItems.length > 0 && fetching && (
              <IonInfiniteScroll>
                <IonInfiniteScrollContent />
              </IonInfiniteScroll>
            )}
          </VList>
        ) : (
          <>
            {header !== undefined && header}

            <div className="flex flex-col flex-1 items-center justify-center">
              {fetching ? (
                <IonSpinner className="h-16 w-16" color="primary" />
              ) : (
                <div className="text-center">
                  <h1 className="text-8xl">😢</h1>
                  <p className="mt-4 text-xl">
                    No {contentItemName}s to see 😢
                    <br />
                    Make a new {contentItemName} to see it here!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </IonContent>
  );
};
