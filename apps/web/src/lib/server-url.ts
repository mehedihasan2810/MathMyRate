function readNodeEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;

  return process.env[name];
}

export function getServerUrl(url: string): string {
  const serverUrl = readNodeEnv("SERVER_URL");

  if (typeof window === "undefined" && serverUrl) {
    return serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
  }

  const normalized = url.endsWith("/") ? url.slice(0, -1) : url;

  if (!normalized.startsWith("/")) {
    return normalized;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }

  const vercelEnv = readNodeEnv("VERCEL_ENV");
  const vercelProductionUrl = readNodeEnv("VERCEL_PROJECT_PRODUCTION_URL");
  const vercelUrl = readNodeEnv("VERCEL_URL");

  const host =
    vercelEnv === "production"
      ? (vercelProductionUrl ?? vercelUrl)
      : (vercelUrl ?? vercelProductionUrl);

  if (host) {
    const origin = host.startsWith("http") ? host : `https://${host}`;

    return `${origin}${normalized}`;
  }

  return `http://localhost:3000${normalized}`;
}
