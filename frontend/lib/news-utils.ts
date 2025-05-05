import { cache } from "react"
import { memoryCache } from "./memory-cache"

// Define the article type
type Article = {
  title: string
  url: string
  source: {
    name: string
  }
  publishedAt: string
  formattedDate: string
  description?: string
  imageUrl?: string | null
  category?: string
  author?: string
}

// Define NewsAPI article type
interface NewsApiArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

// Fallback tech news data
const fallbackTechNews: Article[] = [
  {
    title: "AI Breakthrough: New Model Achieves Human-Level Performance",
    url: "https://example.com/tech-news-1",
    source: { name: "Tech Daily" },
    publishedAt: "2023-04-15T09:30:00Z",
    formattedDate: "April 15, 2023",
  },
  {
    title: "Quantum Computing Reaches Major Milestone with 1000-Qubit Processor",
    url: "https://example.com/tech-news-2",
    source: { name: "Future Tech" },
    publishedAt: "2023-04-14T14:45:00Z",
    formattedDate: "April 14, 2023",
  },
]

// Fallback Ghana news data
const fallbackGhanaNews: Article[] = [
  {
    title: "Ghana's Economy Shows Strong Growth in Q2 2025",
    url: "https://example.com/ghana-economy",
    source: { name: "Ghana News" },
    publishedAt: "2025-04-28T14:30:00Z",
    formattedDate: "April 28, 2025",
    description:
      "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025, exceeding analysts' expectations.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    category: "Business",
    author: "Business Reporter",
  },
  {
    title: "New Educational Reforms Announced by Ghana's Ministry of Education",
    url: "https://example.com/ghana-education",
    source: { name: "Ghana News" },
    publishedAt: "2025-04-27T09:15:00Z",
    formattedDate: "April 27, 2025",
    description:
      "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes across all levels.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    category: "News",
    author: "Education Reporter",
  },
]

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

// Create a cached function to fetch tech news for the homepage
export const getHomePageTechNews = cache(async (): Promise<Article[]> => {
  const CACHE_KEY = "homepage-tech-news"

  // Check memory cache first (fastest)
  const cachedData = memoryCache.get<Article[]>(CACHE_KEY)
  if (cachedData) {
    return cachedData
  }

  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      console.error("NEWS_API_KEY is not defined")
      return fallbackTechNews
    }

    // Calculate dates for the last 5 days
    const today = new Date()
    const fiveDaysAgo = new Date(today)
    fiveDaysAgo.setDate(today.getDate() - 5)

    // Format dates as strings in the required format (YYYY-MM-DD)
    const fromDate = fiveDaysAgo.toISOString().split("T")[0]
    const toDate = today.toISOString().split("T")[0]

    // Use the same parameters as in the provided script
    const sources = "wired,techcrunch,the-verge,ars-technica,engadget,mit-technology-review"
    const domains =
      "bbc.co.uk,techcrunch.com,venturebeat.com,thenextweb.com,artificialintelligence-news.com,aitrends.com"

    const url = `https://newsapi.org/v2/everything?q=AI, Artificial Intelligence&sources=${sources}&domains=${domains}&from=${fromDate}&to=${toDate}&language=en&sortBy=publishedAt&pageSize=2&apiKey=${apiKey}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Multi-AI-Assistant/1.0",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    // Handle 426 Upgrade Required error specifically
    if (response.status === 426) {
      console.error("News API requires a paid subscription for production use")
      return fallbackTechNews
    }

    if (!response.ok) {
      console.error(`News API responded with status: ${response.status}`)
      return fallbackTechNews
    }

    const data = await response.json()

    if (data.status !== "ok" || !data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      console.error("Invalid or empty response from News API")
      return fallbackTechNews
    }

    // Format the articles
    const formattedArticles = data.articles.slice(0, 2).map((article: NewsApiArticle) => ({
      title: article.title,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt,
      formattedDate: formatDate(article.publishedAt),
      description: article.description,
      imageUrl: article.urlToImage,
      author: article.author,
    }))

    // Store in memory cache
    memoryCache.set(CACHE_KEY, formattedArticles)

    return formattedArticles
  } catch (error) {
    console.error("Error fetching tech news for homepage:", error)
    return fallbackTechNews
  }
})

// Create a function to fetch Ghana news for the homepage
export const getHomePageGhanaNews = cache(async (): Promise<Article[]> => {
  try {
    // Fetch from the same API endpoint used by the Ghana news tab
    const response = await fetch("/api/ghana-news", {
      cache: "no-store", // Always get fresh data
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Ghana news: ${response.status}`)
    }

    const data = await response.json()

    if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      throw new Error("No articles found in Ghana news response")
    }

    // Map the API response to our homepage article format (take only first 2)
    return data.articles.slice(0, 2).map((article: any) => ({
      title: article.title,
      url: article.link,
      source: { name: article.source_name || "Ghana News" },
      publishedAt: article.pubDate,
      formattedDate: formatDate(article.pubDate),
      imageUrl: article.imageUrl,
      description: article.description,
    }))
  } catch (error) {
    console.error("Error fetching Ghana news for homepage:", error)
    return fallbackGhanaNews
  }
})
