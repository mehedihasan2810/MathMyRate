import type { Tool } from "../data/tools";

/** The embed page path for a calculator: its last path segment under /embed/. */
export function embedPath(tool: Tool): string {
  const slug = tool.href.split("/").filter(Boolean).at(-1);

  if (!slug) throw new Error(`${tool.name} has no path to embed.`);

  return `/embed/${slug}/`;
}

/**
 * HTML another site pastes to embed a calculator: an iframe plus a visible
 * credit link. It needs absolute addresses, so it requires a configured site.
 */
export function embedSnippet(site: URL, tool: Tool, heightPx: number): string {
  const frame = new URL(embedPath(tool), site).href;
  const page = new URL(tool.href, site).href;

  return [
    `<iframe src="${frame}" title="${tool.name} by MathMyRate" width="100%" height="${heightPx}" style="border:0;max-width:760px" loading="lazy"></iframe>`,
    `<p><a href="${page}">${tool.name}</a> by MathMyRate</p>`,
  ].join("\n");
}
