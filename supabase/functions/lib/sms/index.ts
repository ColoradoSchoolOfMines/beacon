/**
 * @file SMS utilities
 */

import { SendConfig } from "smtp";
import { PhoneNumber } from "libphonenumber-js";

/**
 * SMS gateway
 * @param from Sender email address
 * @param to Recipient phone number
 * @param content Message content
 * @returns Email message
 */
export type Gateway = (
  from: string,
  to: PhoneNumber,
  content: string,
) => SendConfig;

/**
 * SMS provider
 */
export interface Provider {
  /**
   * ISO 3166-1 alpha-2 country code
   */
  country?: string;

  /**
   * Human-readable names
   */
  names: string[];

  /**
   * Gateways
   */
  gateways: Gateway[];
}
