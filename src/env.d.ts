interface ImportMetaEnv {
  /**
   * hCaptcha site key
   */
  readonly VITE_HCAPTCHA_SITEKEY: string;

  /**
   * The Supabase API URL
   */
  readonly VITE_SUPABSE_URL: string;

  /**
   * The Supabase API key
   */
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
