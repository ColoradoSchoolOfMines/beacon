/**
 * @file Generate Supabase schema files
 */

import {writeSupabaseSchema} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await writeSupabaseSchema();

  // Log
  console.info("Schema files generated.");
};

main();
