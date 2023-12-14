/**
 * @file hCaptcha utilities
 */

import {HCAPTCHA_SITE_KEY, HCAPTCHA_SECRET_KEY} from "~/lib/vars.ts";

/**
 * hCaptcha verify URL
 *
 * @see https://docs.hcaptcha.com/#verify-the-user-response-server-side
 */
const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

/**
 * hCaptcha error codes
 *
 * @see https://docs.hcaptcha.com/#siteverify-error-codes-table
 */
enum HCaptchaErrorCodes {
  /**
   * Your secret key is missing.
   */
  MISSING_INPUT_SECRET = "missing-input-secret",

  /**
   * Your secret key is invalid or malformed.
   */
  INVALID_INPUT_SECRET = "invalid-input-secret",

  /**
   * The response parameter (verification token) is missing.
   */
  MISSING_INPUT_RESPONSE = "missing-input-response",

  /**
   * The response parameter (verification token) is invalid or malformed.
   */
  INVALID_INPUT_RESPONSE = "invalid-input-response",

  /**
   * The request is invalid or malformed.
   */
  BAD_REQUEST = "bad-request",

  /**
   * The response parameter has already been checked, or has another issue.
   */
  INVALID_OR_ALREADY_SEEN_RESPONSE = "invalid-or-already-seen-response",

  /**
   * You have used a testing sitekey but have not used its matching secret.
   */
  NOT_USING_DUMMY_PASSCODE = "not-using-dummy-passcode",

  /**
   * The sitekey is not registered with the provided secret.
   */
  SITEKEY_SECRET_MISMATCH = "sitekey-secret-mismatch",
}

/**
 * hCaptcha verify response
 *
 * @see https://docs.hcaptcha.com/#verify-the-user-response-server-side
 */
interface HCaptchaVerifyResponse {
  /**
   * Is the passcode valid, and does it meet security criteria you specified, e.g. sitekey?
   */
  success: boolean;

  /**
   * Timestamp of the challenge (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
   */
  challenge_ts: string;

  /**
   * The hostname of the site where the challenge was solved
   */
  hostname: string;

  /**
   * Any error codes
   */
  "error-codes"?: HCaptchaErrorCodes[];

  /**
   * A score denoting malicious activity (Enterprise only)
   */
  score: number;

  /**
   * Reason(s) for the score (Enterprise only)
   */
  score_reason: string[];
}

/**
 * Verify an hCaptcha token
 * @param token hCaptcha token
 * @returns Whether or not the token is valid
 */
export const verifyHCaptcha = async (token: string) => {
  // Make the request
  const res = await fetch(HCAPTCHA_VERIFY_URL, {
    method: "POST",
    body: new URLSearchParams({
      response: token,
      sitekey: HCAPTCHA_SITE_KEY,
      secret: HCAPTCHA_SECRET_KEY,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to verify hCaptcha: ${await res.text()}`);
  }

  // Parse the response
  const data = (await res.json()) as HCaptchaVerifyResponse;

  // Return the success status
  return data.success;
};
