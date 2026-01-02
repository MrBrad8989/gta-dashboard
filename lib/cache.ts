// Cache simple en memoria para desarrollo
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(key: string, ttl: number = 60000): T | null {
  const cached = cache.get(key);
  if (! cached) return null;
  
  if (Date.now() - cached.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(key?:  string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}