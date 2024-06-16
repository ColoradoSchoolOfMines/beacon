/* eslint-disable unicorn/no-process-exit */
/**
 * @file Programmatic local Supabase instance management
 */

import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {execa} from "execa";

/**
 * Instance status
 */
export interface InstanceStatus {
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
export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Start local Supabase instance
 */
export const start = async () => {
  const {all, exitCode, failed} = await execa(
    "supabase",
    [
      "start",
      "--debug",
    ],
    {
      all: true,
      cwd: root,
      preferLocal: true,
      reject: false,
    },
  );

  if (failed) {
    console.error(`Starting Supabase failed (Exit code ${exitCode}): ${all}`);
    process.exit(1);
  }
};

/**
 * Reset local Supabase instance
 */
export const reset = async () => {
  const {all, exitCode, failed} = await execa(
    "supabase",
    [
      "db",
      "reset",
      "--debug",
    ],
    {
      all: true,
      cwd: root,
      preferLocal: true,
      reject: false,
    },
  );

  console.log(`Output: ${all}`, failed);

  if (failed) {
    console.error(`Resetting Supabase failed (Exit code ${exitCode}): ${all}`);
    process.exit(1);
  }
};

/**
 * Get the status of the local Supabase instance
 * @returns Local Supabase instance status
 */
export const getStatus = async () => {
  // Get the raw status
  const {all, exitCode, failed, stdout} = await execa(
    "supabase",
    [
      "status",
    ],
    {
      all: true,
      cwd: root,
      preferLocal: true,
      reject: false,
    },
  );

  if (failed) {
    console.error(
      `Getting Supabase status failed (Exit code ${exitCode}): ${all}`,
    );

    process.exit(1);
  }

  // Parse the status
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
    console.error(
      `Failed to extract Supabase status (Exit code ${exitCode}): ${all}`,
    );

    process.exit(1);
  }

  const status: InstanceStatus = {
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
 * Get the Supabase schema
 * @returns Supabase schema
 */
export const getSchema = async () => {
  // Generate the arguments
  const args = [
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "public",
    "--debug",
  ];

  // Generate the schema
  const {all, exitCode, failed, stdout} = await execa("supabase", args, {
    all: true,
    cwd: root,
    preferLocal: true,
    reject: false,
  });

  if (failed) {
    console.error(
      `Getting Supabase schema failed (Exit code ${exitCode}): ${all}`,
    );

    process.exit(1);
  }

  return stdout;
};
