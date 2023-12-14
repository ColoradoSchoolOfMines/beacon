import supabase from "@supabase/supabase-js";

const client = new supabase.SupabaseClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);

const res = await client.auth.signInWithPassword({
  email: "test@example.com",
  password: "test",
});

if (res.error !== null) {
  console.error(res.error);
  process.exit(1);
}

console.log(JSON.stringify(res.data, undefined, 2));
