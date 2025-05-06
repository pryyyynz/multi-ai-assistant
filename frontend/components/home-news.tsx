// home-news.tsx
import Link from "next/link"
import { getHomePageGhanaNews } from "@/lib/news-utils"
import { NewsArticleClient } from "@/components/news-article-client"

// Define the Article interface
interface Article {
  url: string
  imageUrl?: string
  title: string
  source: {
    name: string
  }
  formattedDate: string
}

export async function HomeNews() {
  // Option 1: Type assertion - use this if you're confident the returned data matches your interface
  const articles = (await getHomePageGhanaNews()) as Article[]
  
  // Option 2: Alternative approach with safer type checking
  /*
  const rawArticles = await getHomePageGhanaNews()
  
  // Transform or validate the data to ensure it matches your Article interface
  const articles = rawArticles?.map(item => ({
    url: item.url || '',
    imageUrl: item.imageUrl,
    title: item.title || 'Untitled',
    source: {
      name: item.source?.name || 'Unknown Source'
    },
    formattedDate: item.formattedDate || 'No date'
  })) || []
  */

  // If there's no data, show placeholders
  if (!articles || articles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
          No news available
        </div>
        <div className="h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
          Check back later
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.slice(0, 2).map((article, index) => (
        <NewsArticleClient 
          key={index}
          article={article}
        />
      ))}
      <Link href="/news?tab=ghana" className="text-sm text-blue-600 hover:underline block text-center">
        View all Ghana news →
      </Link>
    </div>
  )
}