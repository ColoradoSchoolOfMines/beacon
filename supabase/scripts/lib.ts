/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */
/**
 * @file Supabase utilities
 */

import {constants, unlink, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {parse} from "@fast-csv/parse";
import {execa} from "execa";
import fetch from "node-fetch";
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
 * International ISO 3166-1 alpha-2 code
 */
const internationalAlpha2 = "XX";

/**
 * Country metadata source
 * @see https://github.com/datasets/country-codes
 */
const countryMetadataSrc =
  "https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv";

/**
 * Get country metadata
 * @returns Country metadata
 */
const getCountryMetadata = async () => {
  // Download the metadata
  const res = await fetch(countryMetadataSrc);

  const parser = parse({
    headers: true,
  });

  // Parse and processthe metadata
  const processed = [
    {
      name: "International",
      alpha2: internationalAlpha2,
      alpha3: "XXX",
      numeric: 999,
      tld: null,
      dialing_codes: [],
    },
  ] as {
    name: string;
    alpha2: string;
    alpha3: string;
    numeric: number;
    tld: string | null;
    dialing_codes: string[];
  }[];

  await Promise.all([
    res.body?.pipe(parser).on("data", raw => {
      const name =
        raw["official_name_en"] ||
        raw["UNTERM English Short"] ||
        raw["UNTERM English Formal"] ||
        raw["CLDR display name"];

      processed.push({
        name,
        alpha2: raw["ISO3166-1-Alpha-2"],
        alpha3: raw["ISO3166-1-Alpha-3"],
        numeric: Number(raw["ISO3166-1-numeric"]),
        tld: raw["TLD"].startsWith(".") ? raw["TLD"].slice(1) : raw["TLD"],
        dialing_codes: raw["Dial"].split(","),
      });
    }),
    new Promise<void>(resolve => {
      parser.on("end", resolve);
    }),
  ]);

  return processed;
};

/**
 * Telecom carriers source
 * @see https://github.com/cubiclesoft/email_sms_mms_gateways
 */
const telecomCarriersSrc =
  "https://raw.githubusercontent.com/cubiclesoft/email_sms_mms_gateways/master/sms_mms_gateways.txt";

/**
 * Get telecom carriers
 * @returns Telecom carriers
 */
const getTelecomCarriers = async () => {
  // Download the telecom carriers
  const res = await fetch(telecomCarriersSrc);

  const raw = (await res.json()) as {
    info: string;
    license: string;
    lastupdated: string;
    countries: Record<string, string>;
    sms_carriers: Record<string, Record<string, string[]>>;
    mms_carriers: Record<string, Record<string, string[]>>;
  };

  // Process the data
  const processed = [] as {
    tld?: string;
    name: string;
    sms_gateways: string[];
    mms_gateways: string[];
  }[];

  for (const type of ["sms", "mms"] as const) {
    for (const [region, carriers] of Object.entries(
      type === "sms" ? raw.sms_carriers : raw.mms_carriers,
    )) {
      for (const carrier of Object.values(carriers)) {
        if (carrier.length < 2) {
          console.warn(`Invalid carrier: ${region} ${carrier}!`);
          continue;
        }

        // Find the carrier if it already exists
        const existingCarrier = processed.find(c => c.name === carrier[0]);

        const name = carrier[0]!;

        const gateways = carrier
          .slice(1)
          .map(gateway =>
            gateway.replaceAll(/{\s*number\s*}/g, "{{e164WithoutPlus}}"),
          );

        if (existingCarrier === undefined) {
          processed.push({
            tld: region.length === 2 ? region : undefined,
            name,
            sms_gateways: type === "sms" ? gateways : [],
            mms_gateways: type === "mms" ? gateways : [],
          });
        } else if (type === "sms") {
          existingCarrier.sms_gateways = gateways;
        } else if (type === "mms") {
          existingCarrier.mms_gateways = gateways;
        }
      }
    }
  }

  return processed;
};

/**
 * Database setup files
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

  // Get the country metadata
  const countryMetadata = await getCountryMetadata();

  // Insert the country metadata
  await sql`INSERT INTO public.countries ${sql(
    countryMetadata,
    "name",
    "alpha2",
    "alpha3",
    "numeric",
    "tld",
    "dialing_codes",
  )}`;

  // Get the telecom carriers
  const telecomCarriers = await getTelecomCarriers();

  // Insert the telecom carriers
  for (const telecomCarrier of telecomCarriers) {
    await (telecomCarrier.tld === undefined
      ? sql`
        INSERT INTO public.telecom_carriers (country_id, name, sms_gateways, mms_gateways)
            VALUES ((SELECT id FROM public.countries WHERE alpha2 = ${internationalAlpha2}), ${telecomCarrier.name}, ${telecomCarrier.sms_gateways}, ${telecomCarrier.mms_gateways});
      `
      : sql`
        INSERT INTO public.telecom_carriers (country_id, name, sms_gateways, mms_gateways)
            VALUES ((SELECT id FROM public.countries WHERE tld ILIKE ${telecomCarrier.tld}), ${telecomCarrier.name}, ${telecomCarrier.sms_gateways}, ${telecomCarrier.mms_gateways});
      `);
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
 * Environment file flags
 */
const envFlags = constants.O_CREAT | constants.O_APPEND | constants.O_WRONLY;

/**
 * Write environment files
 */
export const writeEnvs = async () => {
  // Get the current Supabase status
  const status = await getStatus();

  // Create the environment files
  try {
    await writeFile(
      frontendEnv,
      `VITE_HCAPTCHA_SITE_KEY = ""
VITE_SUPABASE_URL = ${JSON.stringify(status.apiUrl)}
VITE_SUPABASE_ANON_KEY = ${JSON.stringify(status.anonKey)}`,
      {
        flag: envFlags,
      },
    );
  } catch (error) {
    if ((error as any)?.code !== "EEXIST") {
      throw error;
    }
  }

  try {
    await writeFile(
      functionsEnv,
      `SMTP_HOST = ""
# SMTP_PORT = 465
# SMTP_TLS = true # Defaults to true when SMTP_PORT is 465, false otherwise
SMTP_USERNAME = ""
SMTP_PASSWORD = ""
# SMTP_FROM = "" # Defaults to SMTP_USERNAME
SUPABASE_DB_URL = ${JSON.stringify(status.dbUrl)}
SUPABASE_URL = ${JSON.stringify(status.apiUrl)}
SUPABASE_ANON_KEY = ${JSON.stringify(status.anonKey)}
SUPABASE_SERVICE_ROLE_KEY = ${JSON.stringify(status.serviceRoleKey)}
SUPABASE_JWT_SECRET = ${JSON.stringify(status.jwtSecret)}
SUPABASE_JWT_ISSUER = ${JSON.stringify(
        new URL("/auth/v1", status.apiUrl).toString(),
      )}`,
      {
        flag: envFlags,
      },
    );
  } catch (error) {
    if ((error as any)?.code !== "EEXIST") {
      throw error;
    }
  }
};

/**
 * Generate the Supabase database schema
 * @param backend Whether or not to generate the backend schema
 * @returns Supabase database schema
 */
export const generateSchema = async (backend: boolean) => {
  // Generate the arguments
  const args = [
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "public",
  ];

  if (backend) {
    args.push("--schema", "auth", "--schema", "utilities");
  }

  // Generate the schema
  const {all, exitCode, failed, stdout} = await execa("supabase", args, {
    all: true,
    cwd: root,
    reject: false,
  });

  if (failed) {
    throw new Error(
      `Generating Supabase schema failed (Exit code ${exitCode}): ${all}`,
    );
  }

  return stdout;
};

/**
 * Frontend schema file
 */
const frontendSchema = join(root, "src", "lib", "schema.ts");

/**
 * Backend schema file
 */
const backendSchema = join(root, "supabase", "functions", "lib", "schema.ts");

/**
 * Write schema files
 */
export const writeSchema = async () => {
  // Write the files
  await writeFile(
    frontendSchema,
    `/**
  * @file Supabase schema
  *
  * This file is automatically generated by npm run supabase:schema. DO NOT MANUALLY EDIT THIS FILE!
  */

 ${await generateSchema(false)}`,
  );

  await writeFile(
    backendSchema,
    `/**
  * @file Supabase schema
  *
  * This file is automatically generated by npm run supabase:schema. DO NOT MANUALLY EDIT THIS FILE!
  */

 ${await generateSchema(true)}`,
  );

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
};
