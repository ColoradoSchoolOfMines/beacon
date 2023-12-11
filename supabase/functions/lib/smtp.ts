/**
 * @file SMTP client
 */

import {SmtpClient} from "smtp";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_TLS,
  SMTP_USERNAME,
} from "~/lib/vars.ts";

/**
 * SMTP client singleton
 */
const smtpClient = new SmtpClient();

// Connect to the SMTP server
if (SMTP_TLS) {
  await smtpClient.connectTLS({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USERNAME,
    password: SMTP_PASSWORD,
  });
} else {
  await smtpClient.connect({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USERNAME,
    password: SMTP_PASSWORD,
  });
}

export {smtpClient};
