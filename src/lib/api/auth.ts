/**
 * @file Backend authentication API
 */

import {Session} from "@supabase/supabase-js";

import {client} from "~/lib/supabase";

/**
 * Begin a phone-based authentication
 * @param telecomCarrier Telecom carrier ID
 * @param number E.164 phone number
 * @param hCaptchaToken hCaptcha token
 * @returns Whether the request was successful
 */
export const beginPhoneAuth = async (
  telecomCarrier: string,
  number: string,
  hCaptchaToken: string,
) => {
  // Make the request
  const {error} = await client.functions.invoke<never>("auth/phone/begin", {
    method: "POST",
    body: {
      hCaptchaToken,
      telecomCarrier,
      number,
    },
  });

  return error !== null;
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
  const {data, error} = await client.functions.invoke<never>("auth/phone/end", {
    method: "POST",
    body: {
      telecomCarrier,
      number,
      code,
    },
  });

  // Handle errors
  if (error !== null) {
    return undefined;
  }

  console.log(data);

  // // Update the session
  // client.auth["_saveSession"]({

  // } as Session);
};
