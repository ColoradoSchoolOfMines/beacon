/**
 * @file Generate Supabase schema files
 */

import {writeSchema} from "./lib";

/**
 * Main async function
 */
const main = async () => {
  await writeSchema();

  // Log
  console.info("Schema files generated.");
};

main();
