/**
 * @file Reset Supabase
 */

import {resetSupabase, writeEnvs} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await resetSupabase();
  await writeEnvs();

  // Log
  console.info(
    "Reset complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
