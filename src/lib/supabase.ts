/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

import {Database} from "~/lib/schema";
import {useEphemeralUIStore} from "~/lib/stores/ephemeral-ui";
import {GlobalMessageMetadata} from "~/lib/types";
import {SUPABASE_ANON_KEY, SUPABASE_URL} from "~/lib/vars";

/**
 * Generic network error message metadata symbol
 */
const GENERIC_NETWORK_ERROR_MESSAGE_METADATA_SYMBOL = Symbol(
  "supabase.network-error",
);

/**
 * Generic server error message metadata symbol
 */
const GENERIC_SERVER_ERROR_MESSAGE_METADATA_SYMBOL = Symbol(
  "supabase.server-error",
);

const setMessage = useEphemeralUIStore.getState().setMessage;

/**
 * Supabase client singleton
 */
export const client = new SupabaseClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    global: {
      /**
       * Custom fetch wrapper
       * @param input Input object
       * @param init Initializer object
       * @returns Fetch response
       */
      fetch: async (input, init) => {
        let res: Response | undefined;

        try {
          res = await fetch(input as any, init);
        } catch (error) {
          // Log the error
          console.error(error);

          // Display the message
          setMessage({
            symbol: GENERIC_NETWORK_ERROR_MESSAGE_METADATA_SYMBOL,
            name: "Network Error",
            description: `${(error as Error).name}: ${
              (error as Error).message
            }`,
          });

          throw error;
        }

        if (res.status === 401) {
          // Sign out
          await client.auth.signOut();
        } else if (!res.ok) {
          // Parse the response body as JSON
          let json: any = {};

          try {
            json = await res.clone().json();
          } catch {
            // Empty
          }

          // Generate the error description
          let description = `${res.statusText} (${res.status})`;

          if (typeof json?.message === "string") {
            description += `: ${json.message}`;
          }

          if (typeof json?.hint === "string") {
            description += ` (${json.hint})`;
          }

          const err: GlobalMessageMetadata = {
            symbol: GENERIC_SERVER_ERROR_MESSAGE_METADATA_SYMBOL,
            name: "Server Error",
            description,
          };

          // Log the error
          console.error(err);

          // Display the message
          setMessage(err);
        }

        return res;
      },
    },
  },
);
