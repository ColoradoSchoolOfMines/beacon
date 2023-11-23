/**
 * @file Start Supabase
 */

import {deleteEnvs, setupDB, start, writeEnvs} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await deleteEnvs();
  await start();
  await setupDB();
  await writeEnvs();

  // Log
  console.info(
    "Setup complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
