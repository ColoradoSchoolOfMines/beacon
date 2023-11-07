/**
 * @file Supabase library
 */

import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

import {execa} from "execa";

/**
 * Root directory
 */
export const root = dirname(fileURLToPath(import.meta.url));

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
 * Get the current Supabase status
 * @returns Supabase status
 */
export const getStatus = async () => {
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
