/**
 * @file Setup Supabase
 */

import {execa} from "execa";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

// Get the root directory
const root = dirname(fileURLToPath(import.meta.url));

/**
 * Setup scripts
 */
const scripts = [
  /*
   * join(root, "sql", "before.sql"),
   * join(root, "sql", "functions.sql"),
   * join(root, "sql", "tables.sql"),
   * join(root, "sql", "triggers.sql"),
   * join(root, "sql", "security.sql"),
   */
  join(root, "sql", "views.sql")
];

/**
 * Main async function
 */
const main = async () => {
  for (const script of scripts) {
    console.info(`Running ${script}...`);

    // Run the script with Psql
    const {all, exitCode, failed} = await execa(
      "psql",
      [
        "-f",
        script
      ],
      {
        /*
         * all: true,
         * cwd: root,
         */
        env: {
          PGHOST: "localhost",
          PGPORT: "54322",
          PGUSER: "postgres",
          PGPASSWORD: "postgres",
          PGDATABASE: "postgres"
        },
        verbose: true
        /*
         * extendEnv: true,
         * reject: true
         */
      }
    );

    if (failed) {
      console.error(`Running setup failed (Exit code ${exitCode}): ${all}`);
      return;
    }
  }

  console.log("Setup complete.");
};

main();
