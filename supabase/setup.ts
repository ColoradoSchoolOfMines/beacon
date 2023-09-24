/**
 * @file Setup Supabase
 */

import postgres from "postgres";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

// Get the root directory
const root = dirname(fileURLToPath(import.meta.url));

/**
 * Setup scripts
 */
const scripts = [
  join(root, "sql", "before.sql"),
  join(root, "sql", "functions.sql"),
  join(root, "sql", "tables.sql"),
  join(root, "sql", "triggers.sql"),
  join(root, "sql", "security.sql"),
  join(root, "sql", "views.sql"),
];

/**
 * Main async function
 */
const main = async () => {
  // Initialize a new Postgres connection
  const sql = postgres({
    database: "postgres",
    host: "localhost",
    password: "postgres",
    port: 54322,
    user: "postgres",
  });

  for (const script of scripts) {
    console.info(`Running ${script}...`);

    // Execute the script
    await sql.file(script, {
      cache: false,
    });
  }

  // Close the Postgres connection
  await sql.end();

  console.log("Setup complete.");
};

main();
