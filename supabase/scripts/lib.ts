/**
 * @file Supabase utilities
 */

import {readFile, unlink, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {execa} from "execa";
import postgres from "postgres";

/**
 * Supabase status
 */
export interface SupabaseStatus {
  /**
   * API URL
   */
  apiUrl: string;

  /**
   * GraphQL URL
   */
  graphUrl: string;

  /**
   * Database URL
   */
  dbUrl: string;

  /**
   * Studio GUI URL
   */
  studioUrl: string;

  /**
   * Inbucket API URL
   */
  inbucketUrl: string;

  /**
   * JWT secret
   */
  jwtSecret: string;

  /**
   * Anonymous API key
   */
  anonKey: string;

  /**
   * Service role API key
   */
  serviceRoleKey: string;
}

/**
 * Project root directory
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Start Supabase
 */
export const start = async () => {
  // Start Supabase
  const {all, exitCode, failed} = await execa(
    "supabase",
    [
      "start",
    ],
    {
      all: true,
      cwd: root,
      reject: false,
    },
  );

  if (failed) {
    throw new Error(`Starting Supabase failed (Exit code ${exitCode}): ${all}`);
  }
};

/**
 * Supabase database setup files
 */
const dbSetupFiles = [
  join(root, "supabase", "sql", "before.sql"),
  join(root, "supabase", "sql", "types.sql"),
  join(root, "supabase", "sql", "functions.sql"),
  join(root, "supabase", "sql", "tables.sql"),
  join(root, "supabase", "sql", "triggers.sql"),
  join(root, "supabase", "sql", "security.sql"),
  join(root, "supabase", "sql", "views.sql"),
];

/**
 * Setup Supabase database
 */
export const setupDB = async () => {
  // Initialize a new Postgres connection
  const sql = postgres({
    database: "postgres",
    host: "localhost",
    password: "postgres",
    port: 54322,
    user: "postgres",
  });

  // Run the setup files
  for (const dbSetupFile of dbSetupFiles) {
    await sql.file(dbSetupFile, {
      cache: false,
    });
  }

  // Close the Postgres connection
  await sql.end();
};

/**
 * Reset Supabase database
 */
export const resetDB = async () => {
  // Reset Supabase
  const {all, exitCode, failed} = await execa(
    "supabase",
    [
      "db",
      "reset",
    ],
    {
      all: true,
      cwd: root,
      reject: false,
    },
  );

  if (failed) {
    throw new Error(
      `Resetting Supabase failed (Exit code ${exitCode}): ${all}`,
    );
  }
};

/**
 * Get the current Supabase status
 * @returns Supabase status
 */
const getStatus = async () => {
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
    },
  );

  if (failed) {
    throw new Error(
      `Getting Supabase status failed (Exit code ${exitCode}): ${all}`,
    );
  }

  // Extract status
  const apiUrl = /API URL: (\S+)/.exec(stdout)?.[1];
  const graphUrl = /GraphQL URL: (\S+)/.exec(stdout)?.[1];
  const dbUrl = /DB URL: (\S+)/.exec(stdout)?.[1];
  const studioUrl = /Studio URL: (\S+)/.exec(stdout)?.[1];
  const inbucketUrl = /Inbucket URL: (\S+)/.exec(stdout)?.[1];
  const jwtSecret = /JWT secret: (\S+)/.exec(stdout)?.[1];
  const anonKey = /anon key: (\S+)/.exec(stdout)?.[1];
  const serviceRoleKey = /service_role key: (\S+)/.exec(stdout)?.[1];

  if (
    apiUrl === undefined ||
    graphUrl === undefined ||
    dbUrl === undefined ||
    studioUrl === undefined ||
    inbucketUrl === undefined ||
    jwtSecret === undefined ||
    anonKey === undefined ||
    serviceRoleKey === undefined
  ) {
    throw new Error(`Failed to extract Supabase status from: ${stdout}`);
  }

  const status: SupabaseStatus = {
    apiUrl,
    graphUrl,
    dbUrl,
    studioUrl,
    inbucketUrl,
    jwtSecret,
    anonKey,
    serviceRoleKey,
  };

  return status;
};

/**
 * Frontend environment file
 */
const frontendEnv = join(root, ".env");

/**
 * Function environment file
 */
const functionsEnv = join(root, "supabase", "functions", ".env");

/**
 * Write environment files
 */
export const writeEnvs = async () => {
  // Get the current Supabase status
  const status = await getStatus();

  // Create the environment files
  await writeFile(
    frontendEnv,
    `VITE_SUPABASE_URL = ${JSON.stringify(status.apiUrl)}
VITE_SUPABASE_KEY = ${JSON.stringify(status.anonKey)}
VITE_HCAPTCHA_SITEKEY = ""
`,
  );

  await writeFile(
    functionsEnv,
    `SUPABASE_DB_URL = ${JSON.stringify(status.dbUrl)}
SUPABASE_URL = ${JSON.stringify(status.apiUrl)}
SUPABASE_ANON_KEY = ${JSON.stringify(status.anonKey)}
SUPABASE_JWT_SECRET = ${JSON.stringify(status.jwtSecret)}
SUPABASE_JWT_ISSUER = ${JSON.stringify(
      new URL("/auth/v1", status.apiUrl).toString(),
    )}`,
  );
};

/**
 * Delete environment files
 */
export const deleteEnvs = async () => {
  await unlink(frontendEnv).catch(() => {});
  await unlink(functionsEnv).catch(() => {});
};

/**
 * Get the Supabase database schema
 * @returns Supabase database schema
 */
export const getSchema = async () => {
  // Get the schema
  const {all, exitCode, failed, stdout} = await execa(
    "supabase",
    [
      "gen",
      "types",
      "typescript",
      "--local",
      "--schema",
      "public",
    ],
    {
      all: true,
      cwd: root,
      reject: false,
    },
  );

  if (failed) {
    throw new Error(
      `Getting Supabase schema failed (Exit code ${exitCode}): ${all}`,
    );
  }

  return stdout;
};

/**
 * Frontend schema file
 */
const frontendSchema = join(root, "src", "lib", "schema.ts");

/**
 * Function schema file
 */
const functionsSchema = join(root, "supabase", "functions", "lib", "schema.ts");

/**
 * Write schema files
 */
export const writeSchema = async () => {
  // Get the Supabase database schema
  const schema = await getSchema();

  const content = `/**
 * @file Supabase schema
 *
 * This file is automatically generated by npm run supabase:schema. DO NOT MANUALLY EDIT THIS FILE!
 */

${schema}`;

  // Write and format the frontend schema file
  await writeFile(frontendSchema, content);

  const {all, exitCode, failed} = await execa(
    "eslint",
    [
      frontendSchema,
      "--fix",
    ],
    {
      all: true,
      cwd: root,
      reject: false,
    },
  );

  if (failed) {
    throw new Error(
      `Formatting Supabase schema failed (Exit code ${exitCode}): ${all}`,
    );
  }

  // Read the formatted frontend schema file
  const formattedFrontendSchema = await readFile(frontendSchema);

  // Write the formatted frontend schema file
  await writeFile(functionsSchema, formattedFrontendSchema);
};
