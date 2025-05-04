import fs from "fs"
import path from "path"
import { cache } from "react"

// Define the cache directory
const CACHE_DIR = path.join(process.cwd(), ".cache")

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
} catch (error) {
  console.error("Failed to create cache directory:", error)
}

// Generic interface for cached data
interface CachedData<T> {
  data: T
  timestamp: number
}

// Function to get cache file path
function getCacheFilePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`)
}

// Function to read from cache
function readFromCache<T>(key: string): CachedData<T> | null {
  try {
    const filePath = getCacheFilePath(key)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContent = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(fileContent) as CachedData<T>
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error)
    return null
  }
}

// Function to write to cache
function writeToCache<T>(key: string, data: T): void {
  try {
    const filePath = getCacheFilePath(key)
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    }
    fs.writeFileSync(filePath, JSON.stringify(cacheData), "utf-8")
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error)
  }
}

// Function to check if cache is valid (less than 24 hours old)
function isCacheValid(timestamp: number): boolean {
  const now = Date.now()
  const cacheAge = now - timestamp
  // Cache is valid for 24 hours (86400000 ms)
  return cacheAge < 86400000
}

// Generic cached fetch function
export const cachedFetch = cache(async <T,>(key: string, fetchFn: () => Promise<T>, fallbackData: T): Promise<T> => {
  try {
    // Try to read from cache first
    const cachedData = readFromCache<T>(key)

    // If we have valid cached data, return it
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      console.log(`Using cached data for ${key}`)
      return cachedData.data
    }

    // Otherwise, fetch fresh data
    console.log(`Fetching fresh data for ${key}`)
    const freshData = await fetchFn()

    // Write the fresh data to cache
    writeToCache(key, freshData)

    return freshData
  } catch (error) {
    console.error(`Error in cachedFetch for ${key}:`, error)

    // If we have any cached data (even if expired), use it as fallback
    const cachedData = readFromCache<T>(key)
    if (cachedData) {
      console.log(`Using expired cache as fallback for ${key}`)
      return cachedData.data
    }

    // Otherwise use the provided fallback data
    return fallbackData
  }
})
