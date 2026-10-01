import { createJevClient, type JevClient } from "../jev/client";

/** Where the API key may be sent: TypeSafe over HTTPS, or a local stand-in for tests. */
function isTrustedEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const typesafe =
    url.protocol === "https:" &&
    (url.hostname === "typesafe.ai" || url.hostname.endsWith(".typesafe.ai"));
  return local || typesafe;
}

/**
 * The Jev client the environment asks for, or null when there is no key or the endpoint would
 * send the key somewhere other than TypeSafe.
 */
export function jevClientFromEnv(env: Record<string, string | undefined>): JevClient | null {
  const apiKey = env.TYPESAFE_API_KEY;
  if (!apiKey) return null;
  const endpoint = env.TYPESAFE_API_URL;
  if (endpoint === undefined) return createJevClient({ apiKey });
  return isTrustedEndpoint(endpoint) ? createJevClient({ apiKey, endpoint }) : null;
}
