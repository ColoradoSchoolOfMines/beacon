/**
 * @file Reset Supabase
 */

import {resetDB, setupDB, writeEnvs} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await resetDB();
  await setupDB();
  await writeEnvs();

  // Log
  console.info(
    "Reset complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
