const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** A stable 32-bit FNV-1a hash of a string, the same in every browser and on the server. */
export function hashString(text: string): number {
  let hash = FNV_OFFSET;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}
