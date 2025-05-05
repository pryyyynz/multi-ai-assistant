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
  source_name?: string
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
      source_name: "Ghana News",
    },
    {
      title: "New Educational Reforms Announced by Ghana's Ministry of Education",
      link: "https://example.com/ghana-education",
      pubDate: "2025-04-27T09:15:00Z",
      description:
        "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes across all levels.",
      category: ["News"],
      imageUrl: "/placeholder.svg?height=200&width=300",
      source_name: "Ghana News",
    },
    {
      title: "Ghana's Tech Startup Ecosystem Sees Record Investment",
      link: "https://example.com/ghana-tech",
      pubDate: "2025-04-26T11:45:00Z",
      description:
        "Ghana's technology startup ecosystem has attracted record levels of investment in the first quarter of 2025.",
      category: ["Business", "Technology"],
      imageUrl: "/placeholder.svg?height=200&width=300",
      source_name: "Ghana News",
    },
    {
      title: "National Football Team Announces New Coach",
      link: "https://example.com/ghana-football",
      pubDate: "2025-04-25T16:20:00Z",
      description: "The Ghana Football Association has appointed a new head coach for the national team.",
      category: ["Sports"],
      imageUrl: "/placeholder.svg?height=200&width=300",
      source_name: "Ghana News",
    },
    {
      title: "Government Launches New Infrastructure Development Plan",
      link: "https://example.com/ghana-infrastructure",
      pubDate: "2025-04-24T09:30:00Z",
      description:
        "The government has unveiled a comprehensive infrastructure development plan aimed at improving transportation networks across the country.",
      category: ["News", "Politics"],
      imageUrl: "/placeholder.svg?height=200&width=300",
      source_name: "Ghana News",
    },
    {
      title: "Health Ministry Announces New Vaccination Campaign",
      link: "https://example.com/ghana-health",
      pubDate: "2025-04-23T14:15:00Z",
      description:
        "The Ministry of Health has launched a nationwide vaccination campaign targeting preventable diseases.",
      category: ["Health"],
      imageUrl: "/placeholder.svg?height=200&width=300",
      source_name: "Ghana News",
    },
  ],
}

// Helper function to clean HTML from text
function cleanHtml(text: string): string {
  // Remove HTML tags
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim()
}

// Helper function to extract image URL from HTML or description
function extractImageUrl(html: string): string | null {
  try {
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
  } catch (e) {
    console.error("Error extracting image URL:", e)
  }
  return null
}

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      console.log("Returning cached Ghana news data")
      return NextResponse.json(cache.data)
    }

    // Try multiple RSS sources in case one fails
    const rssSources = [
      "https://www.myjoyonline.com/feed/",
      "https://www.ghanaweb.com/GhanaHomePage/rss/ghana-news.xml",
      "https://www.pulse.com.gh/rss",
    ]

    let xmlData = null
    let sourceUsed = ""

    // Try each source until one works
    for (const rssUrl of rssSources) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(rssUrl, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          xmlData = await response.text()
          sourceUsed = rssUrl
          console.log(`Successfully fetched from ${rssUrl}`)
          break
        }
      } catch (sourceError) {
        console.error(`Failed to fetch from ${rssUrl}:`, sourceError)
        // Continue to next source
      }
    }

    if (!xmlData) {
      console.error("All RSS sources failed")
      return NextResponse.json(fallbackData)
    }

    // Use cheerio to parse the XML
    const $ = cheerio.load(xmlData, {
      xmlMode: true,
    })

    const articles: GhanaNewsArticle[] = []

    // Process each item in the RSS feed
    $("item").each((i, elem) => {
      try {
        // Extract the title (remove CDATA wrapper if present)
        const titleRaw = $(elem).find("title").text()
        const title = cleanHtml(titleRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim())

        // Extract the link
        const link = $(elem).find("link").text().trim()

        // Extract the publication date
        const pubDate = $(elem).find("pubDate").text().trim()

        // Extract the description (remove CDATA wrapper if present)
        const descriptionRaw = $(elem).find("description").text()
        const descriptionCleaned = descriptionRaw.replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1").trim()

        // Clean description of HTML tags for display
        const description = cleanHtml(descriptionCleaned).substring(0, 200) + "..."

        // Extract the category (remove CDATA wrapper if present)
        const categories: string[] = []
        $(elem)
          .find("category")
          .each((_, catElem) => {
            const categoryText = $(catElem)
              .text()
              .replace(/^\s*<!\[CDATA\[(.*)\]\]>\s*$/, "$1")
              .trim()
            if (categoryText) categories.push(categoryText)
          })

        // Extract the image URL
        let imageUrl = $(elem).find("media\\:content").attr("url") || null

        // If no media:content, try to find enclosure
        if (!imageUrl) {
          imageUrl = $(elem).find("enclosure").attr("url") || null
        }

        // If still no image, try to extract from description
        if (!imageUrl && descriptionCleaned) {
          imageUrl = extractImageUrl(descriptionCleaned)
        }

        // Determine source name from URL
        let source_name = "Ghana News"
        if (sourceUsed.includes("myjoyonline")) {
          source_name = "Joy Online"
        } else if (sourceUsed.includes("ghanaweb")) {
          source_name = "GhanaWeb"
        } else if (sourceUsed.includes("pulse")) {
          source_name = "Pulse Ghana"
        }

        articles.push({
          title,
          link,
          pubDate,
          description,
          category: categories,
          imageUrl: imageUrl || "/placeholder.svg?height=200&width=300",
          source_name,
        })
      } catch (itemError) {
        console.error("Error processing RSS item:", itemError)
        // Continue to next item
      }
    })

    // If we don't have enough articles, use fallback
    if (articles.length === 0) {
      console.log("No articles found, using fallback data")
      return NextResponse.json(fallbackData)
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
