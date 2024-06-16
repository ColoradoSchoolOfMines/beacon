/**
 * @file Generate Supabase schema files
 */

import {writeSupabaseSchema} from "#/scripts/lib";

/**
 * Main async function
 */
const main = async () => {
  await writeSupabaseSchema();

  // Log
  console.info("Schema files generated.");
};

main();
