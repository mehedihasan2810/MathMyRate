import { createAuth as createConfiguredAuth } from "@MathMyRate/auth";
import { type Database, createDb } from "@MathMyRate/db";

import { env } from "./env.server";

export function getDb(): Database {
  return createDb(env);
}

export async function createAuth(database?: Database) {
  return createConfiguredAuth(env, database ?? (await getDb()));
}
