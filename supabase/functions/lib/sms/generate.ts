/**
 * @file SMS API code generator
 */

import camelCase from "camelcase";
import { byCountry } from "country-code-lookup";
import { dirname, fromFileUrl, join } from "std/path/mod.ts";

/**
 * Well-known SMTP ports
 */
const ports = [
  25,
  465,
  587,
  2525,
];

/**
 * Timeout for each connection (in milliseconds)
 */
const timeout = 1000;

/**
 * Source of the SMS gateways
 */
const src =
  "https://raw.githubusercontent.com/mfitzp/List_of_SMS_gateways/master/sms.json";

/**
 * Countries to check for
 */
const countries = [
  "Any",
  "Canada",
  "United States",
];

/**
 * Project root directory
 */
const root = dirname(fromFileUrl(import.meta.url));

/**
 * Check if the domain has an SMTP server
 * @param domain Domain to check
 * @returns Whether or not the domain has an SMTP server
 */
const hasSmtp = async (domain: string) => {
  let valid = false;

  let records: Deno.MXRecord[] = [];
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);

  try {
    records = await Deno.resolveDns(domain, "MX", {
      signal: controller.signal,
    });
  } catch {
    // Ignore
  }

  records = records.filter((record) => record.exchange !== ".")
    .toSorted((a, b) => a.preference - b.preference);

  for (const record of records) {
    // Process the exchange address (Strip the trailing dot)
    const exchange = record.exchange.endsWith(".")
      ? record.exchange.slice(0, -1)
      : record.exchange;

    for (const port of ports) {
      let connection: Deno.TcpConn | undefined;

      try {
        connection = (await Promise.race([
          new Promise((resolve) =>
            setTimeout(() => resolve(undefined), timeout)
          ),
          Deno.connect({
            hostname: exchange,
            port,
            transport: "tcp",
          }),
        ])) as Deno.TcpConn | undefined;
      } catch {
        // Ignore
      }

      if (connection !== undefined) {
        await connection.close();
        valid = true;
        break;
      }
    }

    if (valid) {
      break;
    }
  }

  return valid;
};

// Download the raw list
const res = await fetch(src);
const raw = await res.json() as {
  country: string;
  region: string;
  carrier: string;
  "email-to-sms": string;
  "email-to-mms": string;
  notes: string;
}[];

// Process the raw data
const processed = await Promise.all(raw.map(async (entry) => {
  // Skip
  const email = entry["email-to-sms"] !== ""
    ? entry["email-to-sms"]
    : entry["email-to-mms"];
  if (!countries.includes(entry.country) || email === "") {
    return undefined;
  }

  // Parse the email address
  const segments = email.split("@");

  // Skip
  if (segments.length !== 2 || !await hasSmtp(segments[1])) {
    return undefined;
  }

  // Generate the data
  const note = entry.notes.trim() === "" ? undefined : entry.notes.trim();
  const name = entry.carrier.replace(/\s*\([^\)]+\)/g, "").trim();

  const gatewayID = camelCase(segments[1].trim().replace(/\W/g, "_"));
  const providerID = camelCase(name.replace(/\W/g, "_").trim());

  return {
    gateway: {
      id: gatewayID,
      note,
      email: segments as [string, string],
    },
    provider: {
      id: providerID,
      country: byCountry(entry.country)?.iso2,
      note,
      name,
      gateway: gatewayID,
    },
  };
}));

// Compile the processed data
const gateways = [] as {
  id: string;
  note?: string;
  email: [string, string];
}[];

const providers = [] as {
  id: string;
  country?: string;
  note?: string;
  names: Set<string>;
  gateways: Set<string>;
}[];

for (const entry of processed) {
  if (entry === undefined) {
    continue;
  }

  // Add the gateway
  const gateway = gateways.find((gateway) => gateway.id === entry.gateway.id);

  if (gateway === undefined) {
    gateways.push(entry.gateway);
  } else {
    if (gateway.note === undefined && entry.gateway.note !== undefined) {
      gateway.note = entry.gateway.note;
    }
  }

  // Add the provider
  const provider = providers.find((provider) =>
    provider.id === entry.provider.id
  );

  if (provider === undefined) {
    providers.push({
      id: entry.provider.id,
      country: entry.provider.country,
      note: entry.provider.note,
      names: new Set([entry.provider.name]),
      gateways: new Set([entry.provider.gateway]),
    });
  } else {
    if (provider.note === undefined && entry.provider.note !== undefined) {
      provider.note = entry.provider.note;
    }

    provider.names.add(entry.provider.name);
    provider.gateways.add(entry.provider.gateway);
  }
}

// Sort everything
gateways.sort((a, b) => a.id.localeCompare(b.id));
providers.sort((a, b) => a.id.localeCompare(b.id));

// Output the gateways
await Deno.writeTextFile(
  join(root, "gateways.ts"),
  `/**
 * @file SMS gateways
 *
 * @note This file is generated automatically. Do not edit!
 *
 * @see https://github.com/mfitzp/List_of_SMS_gateways/blob/master/email2sms.csv
 */

import { Gateway } from "~/lib/sms/index.ts";

${
    gateways.map((gateway) =>
      `/**
 * ${gateway.id} gateway${
        gateway.note === undefined ? "" : `
 * @note ${gateway.note}`
      }
 */
export const ${gateway.id}: Gateway = (from, to, content) => ({
  content,
  from,
  subject: "",
  to: ${
        gateway.email[0] === "number"
          ? `\`\${to.nationalNumber}@${gateway.email[1]}\``
          : `\`${gateway.email[0]}@${gateway.email[1]}\` // TODO: update this`
      }
});`
    ).join("\n\n")
  }`,
);

// Output the providers
await Deno.writeTextFile(
  join(root, "providers.ts"),
  `/**
 * @file SMS providers
 *
 * @note This file is generated automatically. Do not edit!
 *
 * @see https://github.com/mfitzp/List_of_SMS_gateways/blob/master/email2sms.csv
 */

import { Provider } from "~/lib/sms/index.ts";
import * as gateways from "~/lib/sms/gateways.ts";

${
    providers.map((provider) =>
      `/**
 * ${provider.id} provider${
        provider.note === undefined ? "" : `
 * @note ${provider.note}`
      }
 */
export const ${provider.id}: Provider = {
  ${
        provider.country !== undefined
          ? `country: "${provider.country}",
  `
          : ""
      }names: [${
        Array.from(provider.names).map((name) => JSON.stringify(name)).join(
          ", ",
        )
      }],
  gateways: [${
        Array.from(provider.gateways).map((gateway) => `gateways.${gateway}`)
          .join(", ")
      }],
};`
    ).join("\n\n")
  }`,
);
