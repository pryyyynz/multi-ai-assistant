"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Sample tech news data based on the API response
const sampleTechNews = [
  {
    title: "Alibaba launches open source Qwen3 besting OpenAI o1",
    source: "VentureBeat",
    date: "April 29, 2025",
    url: "https://venturebeat.com/ai/alibaba-launches-open-source-qwen3-model-that-surpasses-openai-o1-and-deepseek-r1/",
  },
  {
    title: "An Acclaimed Book About Digital Manipulation Was Actually Written by AI",
    source: "Wired",
    date: "April 28, 2025",
    url: "https://www.wired.com/story/an-acclaimed-book-about-digital-manipulation-was-actually-written-by-ai/",
  },
]

export function TechNewsPreview() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </>
      ) : (
        <>
          {sampleTechNews.map((article, index) => (
            <Link href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="block">
              <div className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">{article.title}</h3>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/news?tab=tech" className="text-sm text-gray-600 hover:underline block text-center">
            View all tech news →
          </Link>
        </>
      )}
    </div>
  )
}
