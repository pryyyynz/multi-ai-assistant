"use server"

import { fallbackGhanaNews, fallbackTechNews, NewsApiResponse, GhanaNewsApiResponse } from './constants'

// Helper function to format published date
export async function formatPublishedDate(dateString: string): Promise<string> {
  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Unknown date"
  }

  // Format date as "Month Day, Year"
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Fetch tech news from News API with improved error handling and caching
export async function getTechNews(): Promise<NewsApiResponse> {
  try {
    const today = new Date()
    const fiveDaysAgo = new Date(today)
    fiveDaysAgo.setDate(today.getDate() - 5)

    const fromDate = fiveDaysAgo.toISOString().split("T")[0]
    const toDate = today.toISOString().split("T")[0]

    const apiKey = process.env.NEWS_API_KEY

    if (!apiKey) {
      console.warn("NEWS_API_KEY is not defined, using fallback data")
      return fallbackTechNews
    }

    const sources = "wired,techcrunch,the-verge,ars-technica,engadget,mit-technology-review"
    const domains =
      "bbc.co.uk,techcrunch.com,venturebeat.com,thenextweb.com,artificialintelligence-news.com,aitrends.com"

    const url = `https://newsapi.org/v2/everything?q=AI, Artificial Intelligence&sources=${sources}&domains=${domains}&from=${fromDate}&to=${toDate}&language=en&sortBy=publishedAt&apiKey=${apiKey}`

    // Use a longer cache time to avoid hitting rate limits
    const response = await fetch(url, {
      next: { revalidate: 7200 }, // Cache for 2 hours
      headers: {
        "User-Agent": "Multi-AI-Assistant/1.0",
      },
    })

    if (!response.ok) {
      console.warn(`News API request failed with status ${response.status}`)
      return fallbackTechNews
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching tech news:", error)
    return fallbackTechNews
  }
}

// Fetch Ghana news with improved error handling and caching
export async function getGhanaNews(): Promise<GhanaNewsApiResponse> {
  try {
    // Use a cached version if available to reduce API calls
    const cacheKey = "ghana-news-cache"
    const cachedData = await getCachedData(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const apiKey = "pub_83090774cc754e5d50929e8969c84f48fdf66"

    if (!apiKey) {
      console.warn("Ghana News API key is not defined, using fallback data")
      return fallbackGhanaNews
    }

    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en&country=gh&category=business,domestic,education,entertainment,politics`

    // Use a longer cache time and implement retry logic
    const response = await fetchWithRetry(url, 3)

    if (!response.ok) {
      console.warn(`Ghana News API request failed with status ${response.status}`)
      return fallbackGhanaNews
    }

    const data = await response.json()

    // Cache the successful response
    await cacheData(cacheKey, data, 7200) // Cache for 2 hours

    return data
  } catch (error) {
    console.error("Error fetching Ghana news:", error)
    return fallbackGhanaNews
  }
}

// Helper function to implement retry logic with exponential backoff
async function fetchWithRetry(url: string, maxRetries: number): Promise<Response> {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 7200 }, // Cache for 2 hours
        headers: {
          "User-Agent": "Multi-AI-Assistant/1.0",
        },
      })

      // If we get a 429, wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || Math.pow(2, retries) * 1000
        const waitTime = typeof retryAfter === "string" ? Number.parseInt(retryAfter, 10) * 1000 : retryAfter

        console.warn(`Rate limited. Retrying after ${waitTime}ms`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        retries++
        continue
      }

      return response
    } catch (error) {
      retries++
      if (retries >= maxRetries) throw error

      // Wait with exponential backoff
      const waitTime = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  // If we've exhausted retries, make one last attempt
  return fetch(url, { next: { revalidate: 7200 } })
}

// Simple in-memory cache implementation - these helper functions also need to be async
const cache: Record<string, { data: any; expiry: number }> = {}

async function getCachedData(key: string): Promise<any> {
  const cachedItem = cache[key]
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.data
  }
  return null
}

async function cacheData(key: string, data: any, ttlSeconds: number): Promise<void> {
  cache[key] = {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  }
}