/**
 * @file Miscellaneous utilities
 */

import {User} from "@supabase/supabase-js";
import humanizeDuration, {Options} from "humanize-duration";
import {Duration} from "luxon";

import {AuthState, MeasurementSystem, UserMetadata} from "~/lib/types";

/**
 * Meters to feet conversion factor
 */
export const METERS_TO_FEET = 3.280839895;

/**
 * Meters to kilometers conversion factor
 */
export const METERS_TO_KILOMETERS = 0.001;

/**
 * Miles to meters conversion factor
 */
export const METERS_TO_MILES = 0.000621371;

/**
 * Get the user's current auth state
 * @param user User
 * @returns User's current auth state
 */
export const getAuthState = (user: User | undefined): AuthState => {
  if (user === undefined) {
    return AuthState.UNAUTHENTICATED;
  }

  // Get the user metadata
  const metadata = user.user_metadata as UserMetadata;

  return metadata.acceptedTerms
    ? AuthState.AUTHENTICATED_TERMS
    : AuthState.AUTHENTICATED_NO_TERMS;
};

/**
 * Format a scalar value in a compact notation
 * @param value Scalar value
 * @returns Formatted scalar value
 */
export const formatScalar = (value: number) =>
  new Intl.NumberFormat(navigator.language, {
    style: "decimal",
    notation: "compact",
  }).format(value);

/**
 * Format a distance
 * @param distance Distance in meters
 * @param measurementSystem Desired measurement system
 * @returns Formatted distance
 */
export const formatDistance = (
  distance: number,
  measurementSystem: MeasurementSystem,
) => {
  // Get the unit and convert the distance to the desired measurement system
  let unit: string;
  let convertedDistance: number;

  switch (measurementSystem) {
    case MeasurementSystem.METRIC:
      if (distance < 1000) {
        unit = "meter";
        convertedDistance = distance;
      } else {
        unit = "kilometer";
        convertedDistance = distance * METERS_TO_KILOMETERS;
      }

      break;

    case MeasurementSystem.IMPERIAL:
      if (distance < 1 / METERS_TO_MILES) {
        unit = "foot";
        convertedDistance = distance * METERS_TO_FEET;
      } else {
        unit = "mile";
        convertedDistance = distance * METERS_TO_MILES;
      }

      break;
  }

  return new Intl.NumberFormat(navigator.language, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: 0,
  }).format(convertedDistance);
};

/**
 * Format a duration
 * @param value Duration (In milliseconds)
 * @returns Formatted duration
 */
export const formatDuration = (value: number) => {
  const duration = Duration.fromMillis(value);

  const options: Options = {
    round: true,
  };

  if (duration.as("minutes") < 60) {
    options.units = ["m"];
  } else if (duration.as("hours") < 24) {
    options.units = ["h"];
  } else {
    options.units = ["d"];
  }

  return humanizeDuration(value, options);
};
