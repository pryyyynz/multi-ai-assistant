import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

// Define the structure of a Ghana news article
interface GhanaNewsArticle {
  title: string
  link: string
  pubDate: string
  description: string
  category?: string[]
  imageUrl?: string
}

// In-memory cache
let cache: {
  data: { articles: GhanaNewsArticle[] } | null
  timestamp: number
} = {
  data: null,
  timestamp: 0,
}

// Cache duration in milliseconds (2 hours)
const CACHE_DURATION = 2 * 60 * 60 * 1000

// Fallback data in case the API fails
const fallbackData = {
  articles: [
    {
      title: "Ghana's Economy Shows Strong Growth in Q2 2025",
      link: "https://example.com/ghana-economy",
      pubDate: "2025-04-28T14:30:00Z",
      description:
        "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025, exceeding analysts' expectations.",
      category: ["Business"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "New Educational Reforms Announced by Ghana's Ministry of Education",
      link: "https://example.com/ghana-education",
      pubDate: "2025-04-27T09:15:00Z",
      description:
        "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes across all levels.",
      category: ["News"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Ghana's Tech Startup Ecosystem Sees Record Investment",
      link: "https://example.com/ghana-tech",
      pubDate: "2025-04-26T11:45:00Z",
      description:
        "Ghana's technology startup ecosystem has attracted record levels of investment in the first quarter of 2025.",
      category: ["Business", "Technology"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "National Football Team Announces New Coach",
      link: "https://example.com/ghana-football",
      pubDate: "2025-04-25T16:20:00Z",
      description: "The Ghana Football Association has appointed a new head coach for the national team.",
      category: ["Sports"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Government Launches New Infrastructure Development Plan",
      link: "https://example.com/ghana-infrastructure",
      pubDate: "2025-04-24T09:30:00Z",
      description:
        "The government has unveiled a comprehensive infrastructure development plan aimed at improving transportation networks across the country.",
      category: ["News", "Politics"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Health Ministry Announces New Vaccination Campaign",
      link: "https://example.com/ghana-health",
      pubDate: "2025-04-23T14:15:00Z",
      description:
        "The Ministry of Health has launched a nationwide vaccination campaign targeting preventable diseases.",
      category: ["Health"],
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
  ],
}

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      console.log("Returning cached Ghana news data")
      return NextResponse.json(cache.data)
    }

    const rssUrl = "https://www.pulse.com.gh/rss"
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`RSS feed responded with status: ${response.status}`)
      return NextResponse.json(fallbackData)
    }

    const xmlData = await response.text()

    // Use cheerio to parse the XML
    const $ = cheerio.load(xmlData, {
      xmlMode: true,
    })

    const articles: GhanaNewsArticle[] = []

    // Process each item in the RSS feed
    $("item").each((i, elem) => {
      // Extract the title (remove CDATA wrapper if present)
      const titleRaw = $(elem).find("title").text()
      const title = titleRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()

      // Extract the link
      const link = $(elem).find("link").text().trim()

      // Extract the publication date
      const pubDate = $(elem).find("pubDate").text().trim()

      // Extract the description (remove CDATA wrapper if present)
      const descriptionRaw = $(elem).find("description").text()
      const description = descriptionRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()

      // Extract the category (remove CDATA wrapper if present)
      const categoryRaw = $(elem).find("category").text()
      const categoryText = categoryRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()

      // Split categories if multiple are present
      const category = categoryText ? [categoryText] : []

      // Extract the image URL
      let imageUrl = $(elem).find("media\\:content").attr("url") || null

      // If no media:content, try to find enclosure
      if (!imageUrl) {
        imageUrl = $(elem).find("enclosure").attr("url") || null
      }

      // If still no image, try to extract from description
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i)
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1]
        }
      }

      // Only include business and news categories, or if we can't determine the category
      const lowerCategory = categoryText.toLowerCase()
      if (!categoryText || lowerCategory === "business" || lowerCategory === "news") {
        articles.push({
          title,
          link,
          pubDate,
          description,
          category,
          imageUrl: imageUrl || null,
        })
      }
    })

    // If we don't have enough business/news items, include other categories
    if (articles.length < 6) {
      $("item").each((i, elem) => {
        const titleRaw = $(elem).find("title").text()
        const title = titleRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()

        // Skip if we already have this item
        if (articles.some((item) => item.title === title)) {
          return
        }

        const link = $(elem).find("link").text().trim()
        const pubDate = $(elem).find("pubDate").text().trim()
        const descriptionRaw = $(elem).find("description").text()
        const description = descriptionRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()
        const categoryRaw = $(elem).find("category").text()
        const categoryText = categoryRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()
        const category = categoryText ? [categoryText] : []

        // Extract the image URL
        let imageUrl = $(elem).find("media\\:content").attr("url") || null

        // If no media:content, try to find enclosure
        if (!imageUrl) {
          imageUrl = $(elem).find("enclosure").attr("url") || null
        }

        // If still no image, try to extract from description
        if (!imageUrl && description) {
          const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i)
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1]
          }
        }

        articles.push({
          title,
          link,
          pubDate,
          description,
          category,
          imageUrl: imageUrl || null,
        })
      })
    }

    // Limit to 20 articles
    const result = {
      articles: articles.slice(0, 20),
    }

    // Update the cache
    cache = {
      data: result,
      timestamp: now,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching Ghana news from RSS:", error)
    return NextResponse.json(fallbackData)
  }
}
