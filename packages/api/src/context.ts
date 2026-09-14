import type { createAuth } from "@MathMyRate/auth";
import type { Database } from "@MathMyRate/db";

export type Context = {
  auth: null;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  db: Database;
};
