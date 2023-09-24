/**
 * @file Setup Supabase
 */

import postgres from "postgres";
import {dirname, join} from "node:path";
import {execa} from "execa";
import {fileURLToPath} from "node:url";
import {writeFile} from "node:fs/promises";

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
    // Execute the script
    await sql.file(script, {
      cache: false,
    });
  }

  // Close the Postgres connection
  await sql.end();

  // Get the Supabase status
  const {all, exitCode, failed, stdout} = await execa(
    "supabase",
    [
      "status",
    ],
    {
      all: true,
      cwd: root,
      reject: false,
    }
  );

  if (failed) {
    console.error(
      `Getting Supabase status failed (Exit code ${exitCode}): ${all}`
    );

    return;
  }

  // Extract the API URL and key
  const apiUrl = /API URL: (\S+)/.exec(stdout)?.[1];
  const apiKey = /anon key: (\S+)/.exec(stdout)?.[1];

  if (apiUrl === undefined || apiKey === undefined) {
    throw new Error(`Failed to extract API URL and/or key from: ${stdout}`);
  }

  // Create the environment file
  await writeFile(
    join(root, "..", ".env"),
    `VITE_SUPABASE_URL = ${JSON.stringify(apiUrl)}
VITE_SUPABASE_KEY = ${JSON.stringify(apiKey)}
`
  );

  console.info(
    "Setup complete. You may start your frontend now. (If it's already running, please restart it)"
  );
};

main();
