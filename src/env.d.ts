/**
 * Import meta environment variables
 */
interface ImportMetaEnv {
  /**
   * hCaptcha site key
   */
  readonly VITE_HCAPTCHA_SITE_KEY: string;

  /**
   * The Supabase API URL
   */
  readonly VITE_SUPABSE_URL: string;

  /**
   * The Supabase API key
   */
  readonly VITE_SUPABASE_ANON_KEY: string;

  /**
   * The Sentry DSN
   */
  readonly VITE_SENTRY_DSN?: string;
}

/**
 * Import meta object
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * PWA before install prompt event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * An array of string items containing the platforms on which the event was dispatched. This is provided for user agents that want to present a choice of versions to the user such as, for example, "web" or "play" which would allow the user to choose between a web version or an Android version.
   */
  readonly platforms: string[];

  /**
   * A Promise that resolves to an object describing the user's choice when they were prompted to install the app.
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Show a prompt asking the user if they want to install the app. This method returns a Promise that resolves to an object describing the user's choice when they were prompted to install the app.
   */
  prompt(): Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

// interface WindowEventMap {
//   beforeinstallprompt: BeforeInstallPromptEvent;
// }
