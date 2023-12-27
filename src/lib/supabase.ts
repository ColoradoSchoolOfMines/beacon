/**
 * @file Supabase client
 */

import {SupabaseClient} from "@supabase/supabase-js";

import {Database} from "~/lib/schema";
import {useStore} from "~/lib/state";
import {SUPABASE_ANON_KEY, SUPABASE_URL} from "~/lib/vars";

const setError = useStore.getState().setError;

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
        const res = await fetch(input as any, init);

        if (!res.ok) {
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

          // Set the error
          setError(err);
        }

        return res;
      },
    },
  },
);
