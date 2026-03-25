const DEFAULT_SITE_URL = "https://divijganjoo.me";

export const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const METADATA_BASE = new URL(`${SITE_URL}/`);

export function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  if (!pathOrUrl.startsWith("/")) return `${SITE_URL}/${pathOrUrl}`;
  return `${SITE_URL}${pathOrUrl}`;
}
