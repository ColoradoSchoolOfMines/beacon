/**
 * @file Backend authentication API
 */

import {Session} from "@supabase/supabase-js";

import {client} from "~/lib/supabase";

/**
 * Begin a phone-based authentication
 * @param hCaptchaToken hCaptcha token
 * @param telecomCarrier Telecom carrier ID
 * @param number E.164 phone number withouth the leading `+`
 */
export const beginPhoneAuth = async (
  hCaptchaToken: string,
  telecomCarrier: string,
  number: string,
) => {
  // Make the request
  const res = await fetch("/api/auth/phone/begin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({hCaptchaToken, telecomCarrier, phoneNumber: number}),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to begin phone authentication: ${await res.text()}`,
    );
  }
};

/**
 * End a phone-based authentication
 * @param telecomCarrier Telecom carrier ID
 * @param number E.164 phone number withouth the leading `+`
 * @param code Verification code
 */
export const endPhoneAuth = async (
  telecomCarrier: string,
  number: string,
  code: string,
) => {
  // Make the request
  const res = await fetch("/api/auth/phone/end", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({telecomCarrier, phoneNumber: number, code}),
  });

  if (!res.ok) {
    throw new Error(`Failed to end phone authentication: ${await res.text()}`);
  }

  // Parse the response
  const data = (await res.json()) as {
    session: string;
  };

  console.log(data);

  // // Update the session
  // client.auth["_saveSession"]({

  // } as Session);
};
