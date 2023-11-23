/**
 * @file Reset Supabase
 */

import {deleteEnvs, resetDB, writeEnvs} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await deleteEnvs();
  await resetDB();
  await writeEnvs();

  // Log
  console.info(
    "Reset complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
