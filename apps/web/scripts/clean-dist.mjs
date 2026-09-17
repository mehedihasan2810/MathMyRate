// Empties the previous build output. Astro does not clean dist itself, so a
// build that emits fewer files than the one before it (a preview build after
// a production build, for example) would leave stale files behind, such as a
// production sitemap.xml sitting next to noindex pages.
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

rmSync(fileURLToPath(new URL("../dist", import.meta.url)), { force: true, recursive: true });
