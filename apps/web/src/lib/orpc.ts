import type { AppRouterClient } from "@MathMyRate/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import { env } from "../env.public";
import { getServerUrl } from "./server-url";

export const link = new RPCLink({
  url: `${getServerUrl(env.PUBLIC_SERVER_URL)}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpc: AppRouterClient = createORPCClient(link);
