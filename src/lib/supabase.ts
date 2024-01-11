/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

import {Database} from "~/lib/schema";
import {useMiscellaneousStore} from "~/lib/stores/miscellaneous";
import {FUNCTIONS_URL, SUPABASE_ANON_KEY, SUPABASE_URL} from "~/lib/vars";

/**
 * Functions URL prefix
 */
const FUNCTIONS_PREFIX = "/functions/v1";

const setMessage = useMiscellaneousStore.getState().setMessage;

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
        // Rewrite functions URLs
        if (FUNCTIONS_URL !== undefined) {
          let url: URL;

          if (typeof input === "string") {
            url = new URL(input);
          } else if (input instanceof Request) {
            url = new URL(input.url);
          } else if (input instanceof URL) {
            url = input;
          } else {
            console.error("Invalid input", input);
            throw new TypeError("Invalid input");
          }

          const prefixIndex = url.pathname.indexOf(FUNCTIONS_PREFIX);

          if (prefixIndex === 0) {
            url = new URL(
              FUNCTIONS_URL +
                url.pathname.slice(FUNCTIONS_PREFIX.length) +
                url.search,
            );

            if (typeof input === "string") {
              input = url.toString();
            } else if (input instanceof Request) {
              input = new Request(url.toString(), input);
            } else if (input instanceof URL) {
              input = url;
            }
          }
        }

        let res: Response | undefined;

        try {
          res = await fetch(input as any, init);
        } catch (error) {
          // Log the error
          console.error(error);

          // Display the message
          setMessage({
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

          const err = {
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
