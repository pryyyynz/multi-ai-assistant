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
    totalResults: 2,
    articles: [
      {
        source: {
          id: "techcrunch",
          name: "TechCrunch",
        },
        author: "Tech Reporter",
        title: "New AI Breakthrough Promises More Efficient Language Models",
        description:
          "Researchers have developed a new technique that reduces the computational requirements of large language models by up to 40%.",
        url: "https://example.com/ai-breakthrough",
        urlToImage: "/placeholder.svg?height=200&width=300",
        publishedAt: "2025-04-28 16:45:00",
        content: "In a significant breakthrough for AI research...",
      },
      {
        source: {
          id: "wired",
          name: "Wired",
        },
        author: "Tech Analyst",
        title: "The Future of Quantum Computing: What to Expect in 2026",
        description:
          "Quantum computing is set to reach new milestones in the coming year with several companies announcing commercial applications.",
        url: "https://example.com/quantum-computing",
        urlToImage: "/placeholder.svg?height=200&width=300",
        publishedAt: "2025-04-27 11:30:00",
        content: "Quantum computing has long been promised as the next revolution...",
      },
    ],
  }