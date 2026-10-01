/**
 * Whether a request comes from the page itself, and not from another site through its
 * visitors' browsers, which would spend the API's credits from thousands of addresses.
 * Browsers say where a request comes from; clients that say nothing are not browsers, so they
 * cannot be used that way, and the rate limit is what holds them back.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  return origin === null || origin === new URL(request.url).origin;
}

/**
 * Whether the body is declared as JSON. A browser only sends that from another site after
 * asking permission first, which a plain form or a `no-cors` fetch cannot do.
 */
export function isJson(request: Request): boolean {
  const type = request.headers.get("content-type") ?? "";
  return type.split(";")[0]?.trim().toLowerCase() === "application/json";
}
