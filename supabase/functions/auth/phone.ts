/**
 * @file Phone routes
 */

import mustache from "mustache";
import {Context} from "oak";
import {SMTP_FROM} from "~/lib/vars.ts";
import {SendConfig} from "smtp";
import {generateCode, generateSession, generateTokenHash} from "~/lib/auth.ts";
import {parsePhoneNumber, isValidPhoneNumber} from "libphonenumber-js";
import {serviceRoleClient} from "../lib/supabase.ts";
import {smtpClient} from "~/lib/smtp.ts";
import {z} from "zod";

/**
 * Maximum authentication frequency (in milliseconds)
 *
 * @see https://github.com/supabase/gotrue/blob/master/README.md#phone-auth
 */
const maxFrequency = 60 * 1000;

/**
 * Authentication code expiration time (in milliseconds)
 *
 * @see https://github.com/supabase/gotrue/blob/master/README.md#phone-auth
 */
const expireAfter = 5 * 60 * 1000;

/**
 * Authentication code length
 *
 * @see https://github.com/supabase/gotrue/blob/master/README.md#phone-auth
 */
const codeLength = 6;

/**
 * Begin a phone-based authentication request body schema
 */
const beginPhoneSchema = z.object({
  telecomCarrier: z.string().uuid(),
  phoneNumber: z.string().refine(value => isValidPhoneNumber(value, "US")),
});

/**
 * Begin a phone-based authentication
 * @param ctx Router context
 */
export const beginPhone = async (ctx: Context) => {
  // Parse and validate the request body
  const raw = await ctx.request.body().value;
  const req = await beginPhoneSchema.parseAsync(raw);

  // Lookup the user by phone number
  const userRes1 = await serviceRoleClient
    .schema("auth")
    .from("users")
    .select("id, phone, confirmation_sent_at")
    .eq("phone", req.phoneNumber);

  if (
    userRes1.error !== null ||
    userRes1.data === null ||
    userRes1.data.length > 1
  ) {
    console.error(userRes1.error);
    ctx.throw(500, "Failed to lookup user");
  }

  // Check if the user has been sent a code too recently
  if (
    userRes1.data.length === 1 &&
    userRes1.data[0].confirmation_sent_at !== null &&
    new Date(userRes1.data[0].confirmation_sent_at) >
      new Date(Date.now() - maxFrequency)
  ) {
    ctx.throw(429, "Too many requests");
  }

  let user = userRes1.data[0] as
    | {
        id: string;
        phone: string;
      }
    | undefined;

  // Lookup the telecom carrier
  const carrierRes = await serviceRoleClient
    .schema("public")
    .from("telecom_carriers")
    .select("gateways")
    .eq("id", req.telecomCarrier)
    .single();

  if (carrierRes.error !== null || carrierRes.data === null) {
    console.error(carrierRes.error ?? "Failed to lookup telecom carrier");
    ctx.throw(500, "Failed to lookup telecom carrier");
  }

  // Parse the phone number
  const phoneNumber = parsePhoneNumber(req.phoneNumber, "US");
  const e164WithoutPlus = phoneNumber.format("E.164").slice(1);

  // Create the user if they don't exist
  if (user === undefined) {
    const createUserRes = await serviceRoleClient.auth.admin.createUser({
      email_confirm: false,
      phone: e164WithoutPlus,
      phone_confirm: false,
    });

    if (createUserRes.error !== null || createUserRes.data === null) {
      console.error(createUserRes.error ?? "Failed to create user");
      ctx.throw(500, "Failed to create user");
    }

    user = {
      id: createUserRes.data.user.id,
      phone: createUserRes.data.user.phone!,
    };
  }

  // Generate the code
  const code = generateCode(codeLength);

  // Generate the token hash
  const tokenHash = await generateTokenHash(e164WithoutPlus, code);

  // Store the token hash
  const now = new Date();
  const userRes2 = await serviceRoleClient
    .schema("auth")
    .from("users")
    .update({
      confirmation_token: tokenHash,
      confirmation_sent_at: now.toISOString(),
    })
    .eq("id", user.id);

  if (userRes2.error !== null) {
    console.error(userRes2.error);
    ctx.throw(500, "Failed to update user");
  }

  // Generate the verification email
  const msg = {
    from: SMTP_FROM,
    content: `Your Beacon verification code is ${code}`,
    html: `<p>Your Beacon verification code is <strong>${code}</strong><p>`,
  } as Omit<SendConfig, "to">;

  // Get gateways
  const gateways = Array.from(
    // deno-lint-ignore no-explicit-any
    new Set((carrierRes.data as any).gateways as string[]),
  );

  // Generate the gateway template view
  const view = {
    carrierCode: phoneNumber.carrierCode,
    countryCallingCode: phoneNumber.countryCallingCode,
    e164: phoneNumber.format("E.164"),
    e164WithoutPlus,
    ext: phoneNumber.ext,
    idd: phoneNumber.format("IDD"),
    international: phoneNumber.format("INTERNATIONAL"),
    national: phoneNumber.format("NATIONAL"),
    rfc3966: phoneNumber.format("RFC3966"),
  };

  // Send the verification emails
  for (const gateway of gateways) {
    // Generate the email address
    const to = mustache.render(gateway, view);

    // Send the email
    await smtpClient.send({
      ...msg,
      to,
    });
  }

  ctx.response.status = 200;
};

/**
 * End a phone-based authentication request body schema
 */
const endPhoneSchema = z.object({
  code: z.string().length(codeLength),
  phoneNumber: z.string().refine(value => isValidPhoneNumber(value, "US")),
});

/**
 * End a phone-based authentication
 * @param ctx Router context
 */
export const endPhone = async (ctx: Context) => {
  // Parse and validate the request body
  const raw = await ctx.request.body().value;
  const req = await endPhoneSchema.parseAsync(raw);

  // Generate the token hash
  const tokenHash = await generateTokenHash(req.phoneNumber, req.code);

  // Lookup the user by token hash
  const userRes1 = await serviceRoleClient
    .schema("auth")
    .from("users")
    .select("id, confirmation_sent_at")
    .eq("confirmation_token", tokenHash);

  if (userRes1.error !== null) {
    console.error(userRes1.error);
    ctx.throw(500, "Failed to lookup user");
  } else if (userRes1.data === null || userRes1.data.length !== 1) {
    ctx.throw(401, "Invalid code");
  }

  const user = userRes1.data[0];

  // Check if the code has expired
  if (
    new Date(user.confirmation_sent_at ?? 0) <
    new Date(Date.now() - expireAfter)
  ) {
    ctx.throw(401, "Code expired");
  }

  // Update the user
  const now = new Date();
  const userRes2 = await serviceRoleClient
    .schema("auth")
    .from("users")
    .update({
      confirmation_token: "",
      phone_confirmed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", user.id);

  if (userRes2.error !== null) {
    console.error(userRes2.error);
    ctx.throw(500, "Failed to update user");
  }

  // Generate a session
  const session = await generateSession(user.id, "otp");

  // Return the session
  ctx.response.status = 200;
  ctx.response.body = {
    session,
  };
};
