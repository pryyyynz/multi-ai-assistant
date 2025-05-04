"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { getHomePageTechNews } from "@/lib/news-utils" // assuming this is your fetch function
import Image from "next/image"

export function HomeTechNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const newsArticles = await getHomePageTechNews() // Call your tech news function
        setArticles(newsArticles)
      } catch (error) {
        console.error("Failed to fetch tech news:", error)
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
          No tech news available
        </div>
      </div>
    )
  }

  // Render your articles here similar to HomeNews component
  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Link href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="block">
          {/* Similar structure to HomeNews component */}
        </Link>
      ))}
      <Link href="/news?tab=tech" className="text-sm text-blue-600 hover:underline block text-center">
        View all tech news →
      </Link>
    </div>
  )
}
