/**
 * @file Setup Supabase
 */

import {writeFile} from "node:fs/promises";
import {join} from "node:path";

import postgres from "postgres";

import {getStatus, root} from "./lib";

/**
 * Setup scripts
 */
const scripts = [
  join(root, "sql", "before.sql"),
  join(root, "sql", "types.sql"),
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
    // Execute the script
    await sql.file(script, {
      cache: false,
    });
  }

  // Close the Postgres connection
  await sql.end();

  // Get the current Supabase status
  const status = await getStatus();

  // Create the environment file
  await writeFile(
    join(root, "..", ".env"),
    `VITE_SUPABASE_URL = ${JSON.stringify(status.apiUrl)}
VITE_SUPABASE_KEY = ${JSON.stringify(status.anonKey)}
VITE_HCAPTCHA_SITEKEY = ""
`,
  );

  // Log
  console.info(
    "Setup complete. You may start your frontend now. (If it's already running, please restart it)",
  );
};

main();
