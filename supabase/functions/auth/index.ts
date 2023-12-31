/**
 * @file Authentication edge function
 */

import {Application, Router, isHttpError} from "oak";
import {CORS} from "oak_cors";
import {
  beginRegistration,
  endRegistration,
  beginAuthentication,
  endAuthentication,
} from "~/auth/webauthn.ts";
// Initialize the router
const router = new Router();

// Register routes
router.post("/auth/webauthn/registration/begin", beginRegistration);
router.post("/auth/webauthn/registration/end", endRegistration);
router.post("/auth/webauthn/authentication/begin", beginAuthentication);
router.post("/auth/webauthn/authentication/end", endAuthentication);

// Initialize the app
const app = new Application();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);

    if (isHttpError(error)) {
      ctx.response.status = error.status;
    } else {
      ctx.response.status = 500;
    }

    ctx.response.body = {
      name: error.name,
      description: error.message,
    };
    ctx.response.type = "json";
  }
});

app.use(CORS());
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
await app.listen({port: 8000});
