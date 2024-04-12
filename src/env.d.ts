interface ImportMetaEnv {
  /**
   * hCaptcha site key
   */
  readonly VITE_HCAPTCHA_SITE_KEY: string;

  /**
   * The base URL of the Supabase functions
   */
  readonly VITE_SUPABASE_FUNCTIONS_URL: string;

  /**
   * The Supabase API URL
   */
  readonly VITE_SUPABSE_URL: string;

  /**
   * The Supabase API key
   */
  readonly VITE_SUPABASE_ANON_KEY: string;

  /**
   * The terms and conditions markdown text
   */
  readonly VITE_TERMS_AND_CONDITIONS: string;

  /**
   * The privacy policy markdown text
   */
  readonly VITE_PRIVACY_POLICY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
