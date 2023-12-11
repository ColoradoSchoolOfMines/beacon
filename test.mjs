import supabase from "@supabase/supabase-js";
import {createInterface} from "node:readline";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new supabase.SupabaseClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);

const phone = await new Promise(resolve =>
  readline.question("Phone: ", resolve),
);
const res1 = await client.auth.signInWithOtp({
  phone,
});

if (res1.error !== null) {
  console.error(res1.error);
  process.exit(1);
}

console.log(JSON.stringify(res1.data, undefined, 2));

const code = await new Promise(resolve => readline.question("Code: ", resolve));
const res2 = await client.auth.verifyOtp({
  phone,
  token: code,
  type: "sms",
});

if (res2.error !== null) {
  console.error(res2.error);
  process.exit(1);
}

console.log(JSON.stringify(res2.data, undefined, 2));

process.exit(0);
