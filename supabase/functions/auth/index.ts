/**
 * @file Authentication edge function
 */

import {Application, Router, isHttpError} from "oak";
import {CORS} from "oak_cors";
import {
  beginAttestation,
  endAttestation,
  beginAssertion,
  endAssertion,
} from "~/auth/webauthn.ts";
// Initialize the router
const router = new Router();

// Register routes
router.post("/auth/webauthn/attestate/begin", beginAttestation);
router.post("/auth/webauthn/attestate/end", endAttestation);
router.post("/auth/webauthn/assertion/begin", beginAssertion);
router.post("/auth/webauthn/assertion/end", endAssertion);

// Initialize the app
const app = new Application();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      ctx.response.status = err.status;
    } else {
      ctx.response.status = 500;
    }

    ctx.response.body = {
      name: err.name,
      description: err.message,
    };
    ctx.response.type = "json";
  }
});

app.use(CORS());
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
await app.listen({port: 8000});
