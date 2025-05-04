import { NextResponse } from "next/server"

// Define the structure of a tech news article based on the sample response
interface NewsArticle {
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

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

// In-memory cache
let cache: {
  data: NewsApiResponse | null
  timestamp: number
} = {
  data: null,
  timestamp: 0,
}

// Cache duration in milliseconds (4 hours)
const CACHE_DURATION = 4 * 60 * 60 * 1000

// Fallback data in case the API fails
const fallbackData: NewsApiResponse = {
  status: "ok",
  totalResults: 6,
  articles: [
    {
      source: { id: "wired", name: "Wired" },
      author: "Chris Baraniuk",
      title: "The Climate Crisis Threatens Supply Chains. Manufacturers Hope AI Can Help",
      description:
        "The Covid-19 pandemic showed just how vulnerable global supply chains are. Climate shocks could pose an even greater risk.",
      url: "https://www.wired.com/story/manufacturers-hope-ai-will-save-supply-chains-from-climate-crisis/",
      urlToImage:
        "https://media.wired.com/photos/67bde52c1171429c58ee8b3f/191:100/w_1280,c_limit/022425_Climate-Crisis-Supply-Chain.jpg",
      publishedAt: "2025-05-02T10:00:00Z",
      content:
        "Abhi Ghadge, associate professor of supply chain management at Cranfield University in the UK, says there has been a general kind of negligence in terms of climate resilience, though that is beginning to change.",
    },
    {
      source: { id: "the-verge", name: "The Verge" },
      author: "Chris Welch",
      title: "Apple doesn't seem too worried about Trump's tariffs",
      description:
        "Apple reported its latest quarterly earnings on Wednesday under the backdrop of a court ruling that's poised to upend the company's App Store business and tariff uncertainty that could spur price increases for devices including the iPhone.",
      url: "https://www.theverge.com/news/659650/apple-q2-2025-earnings-tariffs-app-store",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-05-01T18:30:00Z",
      content:
        "Apple reported strong quarterly earnings despite concerns about potential tariffs and App Store changes.",
    },
    {
      source: { id: "techcrunch", name: "TechCrunch" },
      author: "Zack Whittaker",
      title: "New AI Model Can Predict Cyber Attacks Before They Happen",
      description:
        "Researchers have developed an AI system that can predict potential cyber attacks by analyzing patterns in network traffic.",
      url: "https://example.com/tech-news-3",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-30T14:15:00Z",
      content:
        "The new AI model has shown 87% accuracy in predicting potential cyber attacks up to 48 hours before they occur, giving security teams valuable time to prepare defenses.",
    },
    {
      source: { id: "mit-technology-review", name: "MIT Technology Review" },
      author: "Karen Hao",
      title: "Quantum Computing Breakthrough Could Accelerate Drug Discovery",
      description:
        "A new quantum algorithm has demonstrated the ability to simulate complex molecular interactions at unprecedented speeds.",
      url: "https://example.com/tech-news-4",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-29T09:45:00Z",
      content:
        "The quantum computing breakthrough could reduce the time needed for drug discovery from years to months, potentially revolutionizing pharmaceutical research.",
    },
    {
      source: { id: "ars-technica", name: "Ars Technica" },
      author: "Samuel Axon",
      title: "Neural Implant Allows Paralyzed Patients to Control Devices with Thoughts",
      description:
        "A new brain-computer interface has enabled patients with severe paralysis to control digital devices using only their thoughts.",
      url: "https://example.com/tech-news-5",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-28T16:20:00Z",
      content:
        "The neural implant translates brain signals into digital commands with 95% accuracy, allowing patients to browse the web, send messages, and control smart home devices.",
    },
    {
      source: { id: "engadget", name: "Engadget" },
      author: "Devindra Hardawar",
      title: "New Energy Storage Technology Could Make Renewable Power More Reliable",
      description:
        "A startup has developed a novel energy storage solution that can store renewable energy for months without significant loss.",
      url: "https://example.com/tech-news-6",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-27T11:30:00Z",
      content:
        "The new storage technology could solve one of the biggest challenges for renewable energy: providing consistent power regardless of weather conditions or time of day.",
    },
  ],
}

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      console.log("Returning cached tech news data")
      return NextResponse.json(cache.data)
    }

    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) {
      console.error("NEWS_API_KEY is not defined")
      return NextResponse.json(fallbackData)
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

    const url = `https://newsapi.org/v2/everything?q=AI, Artificial Intelligence&sources=${sources}&domains=${domains}&from=${fromDate}&to=${toDate}&language=en&sortBy=publishedAt&apiKey=${apiKey}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Multi-AI-Assistant/1.0",
      },
    })

    // Handle 426 Upgrade Required error specifically
    if (response.status === 426) {
      console.error("News API requires a paid subscription for production use. Using fallback data.")
      return NextResponse.json(fallbackData)
    }

    if (!response.ok) {
      console.error(`News API responded with status: ${response.status}`)
      return NextResponse.json(fallbackData)
    }

    const data = await response.json()

    if (data.status !== "ok" || !data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      console.error("Invalid or empty response from News API")
      return NextResponse.json(fallbackData)
    }

    // Update the cache
    cache = {
      data,
      timestamp: now,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching tech news:", error)
    return NextResponse.json(fallbackData)
  }
}
