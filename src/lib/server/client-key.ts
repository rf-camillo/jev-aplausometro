const IPV6_GROUPS = 8;
/** One connection usually gets a /64; a whole site, or a free tunnel, a /48. */
const CLIENT_GROUPS = 4;
const NETWORK_GROUPS = 3;

/**
 * The first `groups` groups of an IPv6 address, as a prefix like `2001:db8:1::/48`. An IPv4
 * address (or one mapped into IPv6) is returned as itself: it cannot be subdivided further.
 */
export function networkOf(address: string, groups = CLIENT_GROUPS): string {
  if (!address.includes(":")) return address;
  const mappedV4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mappedV4?.[1]) return mappedV4[1];
  const [head = "", tail] = address.toLowerCase().split("%")[0]?.split("::") ?? [];
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const zeros = Array.from({ length: IPV6_GROUPS - left.length - right.length }, () => "0");
  const all = tail === undefined ? left : [...left, ...zeros, ...right];
  const prefix = all.slice(0, groups).map((group) => group.replace(/^0+(?=.)/, ""));
  return `${prefix.join(":")}::/${String(groups * 16)}`;
}

/**
 * The caller's address. `x-real-ip` comes first: the hosting platform (Vercel) sets it, so a
 * client cannot forge it the way it can prepend addresses to `x-forwarded-for`. Hosted
 * elsewhere, a proxy that overwrites it is needed for the limits to hold.
 */
function addressOf(request: Request): string | null {
  const real = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return real || forwarded || null;
}

export function clientKey(request: Request): string {
  const address = addressOf(request);
  return address ? networkOf(address) : "unknown";
}

/**
 * The wider network the caller is in, for a looser second limit: one IPv6 /48, which is what a
 * free tunnel hands out as 65,536 /64s. For IPv4 it is the address again.
 */
export function networkKey(request: Request): string {
  const address = addressOf(request);
  return address ? networkOf(address, NETWORK_GROUPS) : "unknown";
}
