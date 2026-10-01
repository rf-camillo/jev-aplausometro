export interface Lru<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  readonly size: number;
}

/** A least-recently-used cache: reading or writing a key makes it the newest. */
export function createLru<K, V>(capacity: number): Lru<K, V> {
  if (capacity < 1) throw new RangeError("An LRU cache needs room for at least one entry");
  const entries = new Map<K, V>();
  return {
    get(key) {
      if (!entries.has(key)) return undefined;
      const value = entries.get(key) as V;
      entries.delete(key);
      entries.set(key, value);
      return value;
    },
    set(key, value) {
      entries.delete(key);
      entries.set(key, value);
      if (entries.size > capacity) {
        const oldest = entries.keys().next();
        if (!oldest.done) entries.delete(oldest.value);
      }
    },
    get size() {
      return entries.size;
    },
  };
}
