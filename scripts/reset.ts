/**
 * @file Reset Supabase
 */

import {writeEnvs} from "#/scripts/lib";
import {reset} from "#/supabase/supabase";

/**
 * Main async function
 */
const main = async () => {
  await reset();
  await writeEnvs();

  // Log
  console.info(
    "Reset complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
