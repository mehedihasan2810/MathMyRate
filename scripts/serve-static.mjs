import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve, sep } from "node:path";

const root = resolve(process.env.E2E_DIST_DIR ?? "apps/web/dist");
const port = Number(process.env.PORT ?? "4173");

if (!Number.isInteger(port) || port < 0 || port > 65_535) {
  throw new Error(`PORT must be an integer from 0 to 65535; received ${process.env.PORT ?? ""}`);
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function fileInfo(pathname) {
  try {
    return await fs.stat(pathname);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function pathWithinRoot(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = resolve(root, `.${decoded}`);
  const outsideRoot = relative(root, candidate).split(sep)[0] === "..";
  return outsideRoot ? null : candidate;
}

function sendText(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method Not Allowed");
    return;
  }

  let url;
  try {
    url = new URL(request.url ?? "/", "http://localhost");
  } catch {
    sendText(response, 400, "Bad Request");
    return;
  }

  let pathname;
  try {
    pathname = normalize(url.pathname);
  } catch {
    sendText(response, 400, "Bad Request");
    return;
  }

  let target;
  try {
    target = pathWithinRoot(pathname);
  } catch {
    sendText(response, 400, "Bad Request");
    return;
  }
  if (!target) {
    sendText(response, 403, "Forbidden");
    return;
  }

  let stats = await fileInfo(target);
  if (stats?.isDirectory()) {
    target = join(target, "index.html");
    stats = await fileInfo(target);
  } else if (!stats) {
    // Astro emits nested routes as directory indexes. Keep direct nested loads
    // useful when a caller omits the trailing slash.
    const nestedIndex = join(target, "index.html");
    if ((await fileInfo(nestedIndex))?.isFile()) {
      const location = `${url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`}${url.search}`;
      response.writeHead(308, { Location: location, "Cache-Control": "no-store" });
      response.end();
      return;
    }
  }

  if (!stats?.isFile()) {
    sendText(response, 404, "Not Found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Length": stats.size,
    "Content-Type": contentTypes[extname(target).toLowerCase()] ?? "application/octet-stream",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(target)
    .on("error", () => {
      if (!response.headersSent) sendText(response, 500, "Internal Server Error");
      else response.destroy();
    })
    .pipe(response);
});

server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving ${root} on http://0.0.0.0:${port}`);
});
