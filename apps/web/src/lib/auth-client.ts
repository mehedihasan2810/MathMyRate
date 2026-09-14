import { createAuthClient } from "better-auth/client";

import { env } from "../env.public";
import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
  // better-auth derives its route-matching base from this URL's path, so the
  // public auth path must equal the server-side mount (/api/auth everywhere)
  baseURL: new URL("/api/auth", getServerUrl(env.PUBLIC_SERVER_URL)).toString(),
});
