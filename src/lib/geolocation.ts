/**
 * @file Geolocation helper
 */

import {isEqual} from "lodash-es";

import {useStore} from "~/lib/state";
import {client} from "~/lib/supabase";

const setMessage = useStore.getState().setMessage;
const setLocation = useStore.getState().setLocation;

/**
 * Geolocation watcher ID
 */
let geolocationWatcherId: number | undefined;

// Watch the user's geolocation
useStore.subscribe(async state => {
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
    state.setMessage({
      name: "Geolocation error",
      description: "Your browser does not support geolocation.",
    });

    return;
  }

  // Check if the geolocation permission has been denied
  const status = await navigator.permissions.query({name: "geolocation"});

  if (status.state === "denied") {
    // Display the message
    state.setMessage({
      name: "Geolocation error",
      description:
        "You have denied access to your geolocation, but it is required to show and create posts. You can grant Beacon access to your geolocation in your browser settings.",
    });

    return;
  }

  // Watch the user's geolocation
  try {
    geolocationWatcherId = navigator.geolocation.watchPosition(
      async location => {
        const oldLocation = useStore.getState().location;

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
              name: "Failed to update location",
              description: error.message,
            });

            return;
          }
        }
      },
      error => {
        // Display the message
        state.setMessage({
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
    state.setMessage({
      name: "Geolocation error",
      description: `Your geolocation could not be determined: ${error}`,
    });

    return;
  }
});
