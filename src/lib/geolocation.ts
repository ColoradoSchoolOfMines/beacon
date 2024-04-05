/**
 * @file Geolocation helper
 */

import {isEqual} from "lodash-es";

import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {useEphemeralUserStore} from "~/lib/stores/ephemeral-user";
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
    "You have denied access to your geolocation, but it is required to show and create posts. You can grant Beacon access to your geolocation in your browser settings.",
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

const setMessage = useEphemeralUIStore.getState().setMessage;
const setLocation = useEphemeralUserStore.getState().setLocation;

/**
 * Geolocation watcher ID
 */
let geolocationWatcherId: number | undefined;

// Watch the user's geolocation
useEphemeralUserStore.subscribe(async state => {
  // Check if the user is logged in
  if (state.user === undefined) {
    return;
  }

  // Check if the watcher is already running
  if (geolocationWatcherId !== undefined) {
    return;
  }

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

  // Watch the user's geolocation
  try {
    geolocationWatcherId = navigator.geolocation.watchPosition(
      async location => {
        // Ensure the user still exists
        if (geolocationWatcherId !== undefined && state.user === undefined) {
          navigator.geolocation.clearWatch(geolocationWatcherId);
          return;
        }

        // Get the old location
        const oldLocation = useEphemeralUserStore.getState().location;

        // Update the frontend
        setLocation(location);

        // Update the backend
        if (!isEqual(location, oldLocation)) {
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
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 5,
        timeout: 1000 * 10,
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
