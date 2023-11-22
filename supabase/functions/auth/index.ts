/**
 * @file Authentication edge function
 */

import {Application, Router} from "oak";
import {generateChallenge, verifyChallenge} from "~/auth/webauthn.ts";

// Initialize Oak
const router = new Router();

// Register routes
router.post("/auth/webauthn/attestate/begin", generateChallenge);
router.post("/auth/webauthn/attestate/end", generateChallenge);
router.post("/auth/webauthn/authenticate/begin", generateChallenge);
router.post("/auth/webauthn/authenticate/end", verifyChallenge);

// Start the server
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({port: 8000});
