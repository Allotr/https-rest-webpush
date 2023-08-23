import https from "https";
import * as http from "http";
import * as core from 'express-serve-static-core';

import { getLoadedEnvVariables } from "./src/utils/env-loader";
import { initializeWebPush } from "./src/notifications/web-push";
import { initializeGooglePassport } from "src/auth/google-passport";

async function handle(event: any, context: any, cb: any) {
  // When using graphqlHTTP this is not being executed
}

function onExpressServerCreated(app: core.Express) {
  // Create GraphQL HTTP server
  // IMPORTANT: ENVIRONMENT VARIABLES ONLY ARE AVAILABLE HERE AND ON onExpressServerListen
  initializeGooglePassport(app);
  initializeWebPush(app);
}

async function onExpressServerListen(server: https.Server | http.Server) {
  // MongoDB Connection
  const { HTTPS_PORT } = getLoadedEnvVariables();

  console.log(`https-rest-webpush server running on port ${HTTPS_PORT}`);
}


export { handle, onExpressServerCreated, onExpressServerListen };
