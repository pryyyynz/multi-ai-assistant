"use server"

import { revalidatePath } from "next/cache"

export type NewsArticle = {
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    name: string
  }
  author?: string
}

export type NewsResponse = {
  status: string
  totalResults?: number
  articles?: NewsArticle[]
  code?: string
  message?: string
}

// Fallback tech news data
export const fallbackTechNews: NewsResponse = {
  status: "ok",
  totalResults: 2,
  articles: [
    {
      title: "AI Breakthrough: New Model Achieves Human-Level Performance",
      description:
        "Researchers have developed a new AI model that demonstrates human-level performance across a wide range of tasks, marking a significant milestone in artificial intelligence research.",
      url: "https://example.com/tech-news-1",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2023-04-15T09:30:00Z",
      source: { name: "Tech Daily" },
      author: "AI Researcher",
    },
    {
      title: "Quantum Computing Reaches Major Milestone with 1000-Qubit Processor",
      description:
        "A leading quantum computing company has announced the development of a 1000-qubit quantum processor, potentially bringing practical quantum computing applications closer to reality.",
      url: "https://example.com/tech-news-2",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2023-04-14T14:45:00Z",
      source: { name: "Future Tech" },
      author: "Quantum Specialist",
    },
  ],
}

// Format the published date
export async function formatPublishedDate(dateString: string): Promise<string> {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

// Fetch tech news
export async function getTechNews(): Promise<NewsResponse> {
  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      console.error("NEWS_API_KEY is not defined")
      return fallbackTechNews
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&pageSize=10&language=en&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    // Handle 426 Upgrade Required error specifically
    if (response.status === 426) {
      console.error("News API requires a paid subscription for production use. Using fallback data.")
      return {
        status: "error",
        code: "upgradeRequired",
        message: "News API requires a paid subscription for production use.",
        articles: fallbackTechNews.articles,
      }
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

    return data
  } catch (error) {
    console.error("Error fetching tech news:", error)
    return fallbackTechNews
  }
}

// Fetch tech news for the news page
export async function fetchTechNews() {
  try {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      console.error("NEWS_API_KEY is not defined")
      return { results: [] }
    }

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&category=technology&language=en&size=12`,
      { next: { revalidate: 3600 } },
    )

    if (!response.ok) {
      console.error(`NewsData.io API responded with status: ${response.status}`)
      return {
        results: [
          {
            title: "AI Breakthrough: New Model Achieves Human-Level Performance",
            description:
              "Researchers have developed a new AI model that demonstrates human-level performance across a wide range of tasks.",
            link: "https://example.com/tech-news-1",
            image_url: "/placeholder.svg?height=200&width=300",
            pubDate: "2023-04-15T09:30:00Z",
            source_name: "Tech Daily",
            category: ["technology"],
          },
          {
            title: "Quantum Computing Reaches Major Milestone with 1000-Qubit Processor",
            description:
              "A leading quantum computing company has announced the development of a 1000-qubit quantum processor.",
            link: "https://example.com/tech-news-2",
            image_url: "/placeholder.svg?height=200&width=300",
            pubDate: "2023-04-14T14:45:00Z",
            source_name: "Future Tech",
            category: ["technology"],
          },
        ],
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching tech news:", error)
    return {
      results: [
        {
          title: "AI Breakthrough: New Model Achieves Human-Level Performance",
          description:
            "Researchers have developed a new AI model that demonstrates human-level performance across a wide range of tasks.",
          link: "https://example.com/tech-news-1",
          image_url: "/placeholder.svg?height=200&width=300",
          pubDate: "2023-04-15T09:30:00Z",
          source_name: "Tech Daily",
          category: ["technology"],
        },
        {
          title: "Quantum Computing Reaches Major Milestone with 1000-Qubit Processor",
          description:
            "A leading quantum computing company has announced the development of a 1000-qubit quantum processor.",
          link: "https://example.com/tech-news-2",
          image_url: "/placeholder.svg?height=200&width=300",
          pubDate: "2023-04-14T14:45:00Z",
          source_name: "Future Tech",
          category: ["technology"],
        },
      ],
    }
  }
}

// Fetch Ghana news from our API route
export async function fetchGhanaNews() {
  try {
    const response = await fetch("/api/ghana-news", { next: { revalidate: 3600 } })

    if (!response.ok) {
      console.error(`Ghana news API responded with status: ${response.status}`)
      return {
        articles: [
          {
            title: "Ghana's Economy Shows Strong Growth in Q2 2025",
            link: "https://example.com/ghana-economy",
            pubDate: "2025-04-28T14:30:00Z",
            description:
              "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025.",
            category: ["Business"],
            imageUrl: "/placeholder.svg?height=200&width=300",
          },
          {
            title: "New Educational Reforms Announced by Ghana's Ministry of Education",
            link: "https://example.com/ghana-education",
            pubDate: "2025-04-27T09:15:00Z",
            description:
              "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes.",
            category: ["News"],
            imageUrl: "/placeholder.svg?height=200&width=300",
          },
        ],
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Ghana news:", error)
    return {
      articles: [
        {
          title: "Ghana's Economy Shows Strong Growth in Q2 2025",
          link: "https://example.com/ghana-economy",
          pubDate: "2025-04-28T14:30:00Z",
          description:
            "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025.",
          category: ["Business"],
          imageUrl: "/placeholder.svg?height=200&width=300",
        },
        {
          title: "New Educational Reforms Announced by Ghana's Ministry of Education",
          link: "https://example.com/ghana-education",
          pubDate: "2025-04-27T09:15:00Z",
          description:
            "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes.",
          category: ["News"],
          imageUrl: "/placeholder.svg?height=200&width=300",
        },
      ],
    }
  }
}

// Revalidate the news page to refresh the data
export async function revalidateNews() {
  revalidatePath("/news")
}
