/**
 * A record with a value for every key, built from the list of keys. `Object.fromEntries` loses
 * the keys' type, so each use would need a cast; this keeps the one cast here, where the loop
 * shows every key gets its value.
 */
export function recordFrom<K extends string, V>(
  keys: readonly K[],
  valueOf: (key: K) => V,
): Record<K, V> {
  const record = {} as Record<K, V>;
  for (const key of keys) record[key] = valueOf(key);
  return record;
}
