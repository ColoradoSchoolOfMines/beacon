/**
 * @file Authentication edge function
 */

import {Application, Router} from "oak";
import {
  beginAttestation,
  endAttestation,
  beginAssertion,
  endAssertion,
} from "~/auth/webauthn.ts";

// Initialize Oak
const router = new Router();

// Register routes
router.post("/auth/webauthn/attestate/begin", beginAttestation);
router.post("/auth/webauthn/attestate/end", endAttestation);
router.post("/auth/webauthn/authenticate/begin", beginAssertion);
router.post("/auth/webauthn/authenticate/end", endAssertion);

// Start the server
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({port: 8000});
