/**
 * @file Geolocation helper
 */

import {User} from "@supabase/supabase-js";
import {isEqual} from "lodash-es";
import {once} from "lodash-es";

import {useEphemeralStore} from "~/lib/stores/ephemeral";
import {client} from "~/lib/supabase";
import {GlobalMessageMetadata} from "~/lib/types";

/**
 * No geolocation support message metadata
 */
const NO_GEOLOCATION_SUPPORT_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("geolocation.no-support"),
  name: "Geolocation error",
  description: "Your browser does not support geolocation.",
};

/**
 * Geolocation permission denied message metadata
 */
const GEOLOCATION_PERMISSION_DENIED_MESSAGE_METADATA: GlobalMessageMetadata = {
  symbol: Symbol("geolocation.permission-denied"),
  name: "Geolocation error",
  description:
    "You have denied access to your geolocation, but it is required to show and create posts. You can grant Beacon access to your geolocation in your browser settings and then refresh the page to try again.",
};

/**
 * Failed to update location message metadata symbol
 */
const FAILED_TO_UPDATE_LOCATION_MESSAGE_METADATA_SYMBOL = Symbol(
  "geolocation.failed-to-update-location",
);

/**
 * Generic geolocation error metadata symbol
 */
const GENERIC_GEOLOCATION_ERROR_METADATA_SYMBOL = Symbol(
  "geolocation.generic-error",
);

const setMessage = useEphemeralStore.getState().setMessage;
/**
 * Get the user's current location
 * @returns User's current location
 */
const getLocation = () => useEphemeralStore.getState().location;
const setLocation = useEphemeralStore.getState().setLocation;

/**
 * Geolocation updater
 * @param user User
 */
const geolocationUpdater = once(async (user: User | null | undefined) => {
  // Check if geolocation is supported
  if (navigator.geolocation === undefined) {
    // Display the message
    setMessage(NO_GEOLOCATION_SUPPORT_MESSAGE_METADATA);

    return;
  }

  // Check if the geolocation permission has been denied
  const status = await navigator.permissions.query({name: "geolocation"});

  if (status.state === "denied") {
    // Display the message
    setMessage(GEOLOCATION_PERMISSION_DENIED_MESSAGE_METADATA);

    return;
  }

  /**
   * Geolocation watcher ID
   */
  let geolocationWatcherId: number | undefined;

  // Watch the user's geolocation
  try {
    geolocationWatcherId = navigator.geolocation.watchPosition(
      async location => {
        // Ensure the user still exists
        if (
          geolocationWatcherId !== undefined &&
          (user === undefined || user === null)
        ) {
          navigator.geolocation.clearWatch(geolocationWatcherId);
          return;
        }

        // Get the old location
        const oldLocation = getLocation();

        if (!isEqual(location, oldLocation)) {
          // Update the frontend
          setLocation(location);

          // Update the backend
          const {error} = await client.from("locations").insert({
            location: `POINT(${location.coords.longitude} ${location.coords.latitude})`,
          });

          // Handle error
          if (error !== null) {
            setMessage({
              symbol: FAILED_TO_UPDATE_LOCATION_MESSAGE_METADATA_SYMBOL,
              name: "Failed to update location",
              description: error.message,
            });

            return;
          }
        }
      },
      error => {
        // Display the message
        setMessage({
          symbol: GENERIC_GEOLOCATION_ERROR_METADATA_SYMBOL,
          name: "Geolocation error",
          description: `Failed to get geolocation (${error.code}): ${error.message}`,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 5,
        timeout: 1000 * 60,
      },
    );
  } catch (error) {
    // Display the message
    setMessage({
      symbol: GENERIC_GEOLOCATION_ERROR_METADATA_SYMBOL,
      name: "Geolocation error",
      description: `Your geolocation could not be determined: ${error}`,
    });

    return;
  }
});

// Watch the user
const unsubscribeEphemeralStore = useEphemeralStore.subscribe(
  state => state.user,
  user => {
    // Check if the user is logged in
    if (user === undefined || user === null) {
      return;
    }

    // Start the geolocation updater (Not guaranteed to only run once, hence the `once` wrapper)
    geolocationUpdater(user);

    // Unsuscribe from further updates
    unsubscribeEphemeralStore();
  },
);
