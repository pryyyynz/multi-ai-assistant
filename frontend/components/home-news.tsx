"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { getHomePageGhanaNews } from "@/lib/news-utils"
import Image from "next/image"

export function HomeNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const newsArticles = await getHomePageGhanaNews()
        setArticles(newsArticles)
      } catch (error) {
        console.error("Failed to fetch news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
          Loading...
        </div>
      </div>
    )
  }

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
      {articles.map((article, index) => (
        <Link href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="block">
          <div className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start gap-3">
              {article.imageUrl && (
                <div className="flex-shrink-0 w-16 h-16 relative overflow-hidden rounded-md">
                  <Image
                    src={article.imageUrl || "/placeholder.svg?height=64&width=64"}
                    alt={article.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">{article.title}</h3>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{article.source?.name}</span>
                  <span>{article.formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      <Link href="/news?tab=ghana" className="text-sm text-blue-600 hover:underline block text-center">
        View all Ghana news →
      </Link>
    </div>
  )
}
