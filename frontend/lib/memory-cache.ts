// Simple in-memory cache implementation
// This will be faster than file-based cache but doesn't persist between server restarts

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly TTL: number = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  // Get an item from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    // If no entry exists, return null
    if (!entry) {
      return null
    }

    // Check if the entry has expired
    const now = Date.now()
    if (now - entry.timestamp > this.TTL) {
      // Remove expired entry
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Set an item in cache
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  // Check if an item exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    const now = Date.now()
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete an item from cache
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all items from cache
  clear(): void {
    this.cache.clear()
  }
}

// Export a singleton instance
export const memoryCache = new MemoryCache()
