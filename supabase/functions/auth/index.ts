/**
 * @file Authentication edge function
 */

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { generateChallenge, verifyChallenge } from "./webauthn.ts";

// Initialize Oak
const router = new Router();

// Register routes
router.post("/auth/webauthn/generate", generateChallenge);
router.post("/auth/webauthn/verify", verifyChallenge);

// Start the server
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8000 });
