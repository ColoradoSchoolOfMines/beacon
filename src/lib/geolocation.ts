/**
 * @file Geolocation helper
 */

import {useStore} from "~/lib/state";

const setMessage = useStore.getState().setMessage;
const setLocation = useStore.getState().setLocation;

/**
 * Geolocation watcher ID
 */
let geolocationWatcherId: number | undefined;

/**
 * Start watching the user's current geolocation
 */
export const watchGeolocation = async () => {
  // Check if the watcher is already running
  if (geolocationWatcherId !== undefined) {
    return;
  }

  // Check if geolocation is supported
  if (navigator.geolocation === undefined) {
    // Display the message
    setMessage({
      name: "Geolocation error",
      description: "Your browser does not support geolocation.",
    });

    return;
  }

  // Check if the geolocation permission has been denied
  const status = await navigator.permissions.query({name: "geolocation"});

  if (status.state === "denied") {
    // Display the message
    setMessage({
      name: "Geolocation error",
      description:
        "You have denied access to your geolocation, but it is required to show nearby posts. You can grant Beacon access to your geolocation in your browser settings.",
    });

    return;
  }

  // Watch the user's geolocation
  try {
    geolocationWatcherId = navigator.geolocation.watchPosition(
      setLocation,
      error => {
        // Display the message
        setMessage({
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
      name: "Geolocation error",
      description: `Your geolocation could not be determined: ${error}`,
    });

    return;
  }
};
