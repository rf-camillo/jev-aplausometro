const LOCAL = "http://localhost:3000";

/** The public address of the site, used for absolute links in shared cards and metadata. */
export function siteUrl(): URL {
  return new URL(process.env.SITE_URL ?? LOCAL);
}

export function siteHost(): string {
  return siteUrl().host;
}
