/**
 * @file Start Supabase
 */

import {writeEnvs} from "#/scripts/lib";
import {start} from "#/supabase/supabase";

/**
 * Main async function
 */
const main = async () => {
  await start();
  await writeEnvs();

  // Log
  console.info(
    "Setup complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
