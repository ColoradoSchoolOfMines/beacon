window.__VITE_VARS__ = {
  VITE_SUPABASE_URL: {{env "CADDY_SUPABASE_URL" | mustToRawJson}},
  VITE_SUPABASE_ANON_KEY: {{env "CADDY_SUPABASE_ANON_KEY" | mustToRawJson}},
  VITE_HCAPTCHA_SITE_KEY: {{env "CADDY_HCAPTCHA_SITE_KEY" | mustToRawJson}},
  VITE_SENTRY_DSN: {{env "CADDY_SENTRY_DSN" | mustToRawJson}},
};
