/**
 * @file Miscellaneous utilities
 */

import {User} from "@supabase/supabase-js";

import {RequiredAuthState} from "~/lib/types";

/**
 * Check if the user meets the required authentication state
 * @param user User
 * @param requiredState Required authentication state
 * @returns Whether the user meets the required authentication state
 */
export const checkRequiredAuthState = (
  user: User | undefined,
  requiredState: RequiredAuthState,
): boolean => {
  switch (requiredState) {
    case RequiredAuthState.AUTHENTICATED:
      return user !== undefined;

    case RequiredAuthState.UNAUTHENTICATED:
      return user === undefined;

    case RequiredAuthState.ANY:
      return true;
  }
};

/**
 * Create a data URL for the blob
 * @param raw Raw blob
 * @returns Data URL
 */
export const createDataURL = async (raw: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(raw);

  await new Promise(resolve =>
    reader.addEventListener("load", resolve, {
      once: true,
    }),
  );

  return reader.result as string;
};
