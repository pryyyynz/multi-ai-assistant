// Types for News API response
export interface NewsArticle {
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
  content: string
}

export interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

// Types for Ghana News API response
export interface GhanaNewsArticle {
  article_id: string
  title: string
  link: string
  keywords: string[] | null
  creator: string[] | null
  description: string | null
  content: string
  pubDate: string
  image_url: string | null
  source_id: string
  source_name: string
  category: string[]
}

export interface GhanaNewsApiResponse {
  status: string
  totalResults: number
  results: GhanaNewsArticle[]
  nextPage: string
}

// Sample fallback data for Ghana news when API fails
export const fallbackGhanaNews: GhanaNewsApiResponse = {
  status: "success",
  totalResults: 2,
  results: [
    {
      article_id: "fallback-1",
      title: "Ghana's Economy Shows Strong Growth in Q2 2025",
      link: "https://example.com/ghana-economy",
      keywords: ["economy", "growth", "ghana"],
      creator: ["Ghana News"],
      description:
        "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025, exceeding analysts' expectations.",
      content: "Ghana's economy continues to show strong growth...",
      pubDate: "2025-04-28 14:30:00",
      image_url: "/placeholder.svg?height=200&width=300",
      source_id: "fallback",
      source_name: "Ghana Economic News",
      category: ["business", "economy"],
    },
    {
      article_id: "fallback-2",
      title: "New Educational Reforms Announced by Ghana's Ministry of Education",
      link: "https://example.com/ghana-education",
      keywords: ["education", "reforms", "ghana"],
      creator: ["Education Reporter"],
      description:
        "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes across all levels.",
      content: "In a press conference held yesterday...",
      pubDate: "2025-04-27 09:15:00",
      image_url: "/placeholder.svg?height=200&width=300",
      source_id: "fallback",
      source_name: "Ghana Education News",
      category: ["education", "politics"],
    },
  ],
  nextPage: "",
}

// Sample fallback data for tech news when API fails
export const fallbackTechNews: NewsApiResponse = {
  status: "ok",
  totalResults: 5,
  articles: [
    {
      source: {
        id: "techcrunch",
        name: "TechCrunch",
      },
      author: "Tech Reporter",
      title: "OpenAI Introduces GPT-5 with Enhanced Reasoning Capabilities",
      description:
        "OpenAI has unveiled GPT-5, its most advanced language model yet, featuring significantly improved reasoning, planning, and problem-solving abilities that bring AI closer to human-like cognition.",
      url: "https://example.com/ai-breakthrough",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-05-01T16:45:00Z",
      content: "OpenAI has unveiled GPT-5, its most advanced language model yet...",
    },
    {
      source: {
        id: "wired",
        name: "Wired",
      },
      author: "Tech Analyst",
      title: "Quantum Computing Reaches Commercial Viability with New Error Correction Breakthrough",
      description:
        "A major breakthrough in quantum error correction has finally made quantum computers practical for commercial applications, with IBM and Google announcing their first enterprise-ready quantum systems.",
      url: "https://example.com/quantum-computing",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-29T11:30:00Z",
      content: "Quantum computing has finally crossed the threshold into commercial viability...",
    },
    {
      source: {
        id: "mit-technology-review",
        name: "MIT Technology Review",
      },
      author: "AI Researcher",
      title: "Neural Interfaces Achieve Breakthrough in Treating Neurological Disorders",
      description:
        "New neural interface technology has demonstrated unprecedented success in treating previously intractable neurological conditions, offering hope for millions of patients worldwide.",
      url: "https://example.com/neural-interfaces",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-27T09:15:00Z",
      content: "A new generation of neural interfaces is revolutionizing treatment options...",
    },
    {
      source: {
        id: "the-verge",
        name: "The Verge",
      },
      author: "Tech Editor",
      title: "Apple Unveils Mixed Reality Ecosystem with Next-Generation Vision Pro",
      description:
        "Apple has expanded its mixed reality platform with a new generation of Vision Pro headsets and an ecosystem of applications designed to blend digital and physical worlds seamlessly.",
      url: "https://example.com/apple-vision",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-25T14:20:00Z",
      content: "Apple's second-generation Vision Pro represents a significant leap forward...",
    },
    {
      source: {
        id: "ars-technica",
        name: "Ars Technica",
      },
      author: "Science Reporter",
      title: "Fusion Energy Startup Achieves Net Energy Gain in Compact Reactor",
      description:
        "A breakthrough in fusion energy has been achieved by a startup using a novel compact reactor design, potentially putting commercial fusion power within reach within this decade.",
      url: "https://example.com/fusion-energy",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: "2025-04-23T10:45:00Z",
      content: "The long-awaited breakthrough in fusion energy may finally be here...",
    },
  ],
}
