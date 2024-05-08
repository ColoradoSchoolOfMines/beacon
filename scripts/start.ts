/**
 * @file Start Supabase
 */

import {startSupabase, writeEnvs} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await startSupabase();
  await writeEnvs();

  // Log
  console.info(
    "Setup complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
