"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Sample Ghana news data based on the API response
const sampleGhanaNews = [
  {
    title: "I had nothing, but I chose Jesus over fame – Yaw Siki",
    source: "Ghanamma",
    date: "April 29, 2025",
    url: "https://www.ghanamma.com/2025/04/29/i-had-nothing-but-i-chose-jesus-over-fame-yaw-siki/",
  },
  {
    title: "Kennedy Agyapong's supporter allegedly stabbed at NPP's Thank You tour in Bantama",
    source: "Ghanamma",
    date: "April 29, 2025",
    url: "https://www.ghanamma.com/2025/04/29/kennedy-agyapongs-supporter-allegedly-stabbed-at-npps-thank-you-tour-in-bantama-2/",
  },
]

export function GhanaNewsPreview() {
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
          {sampleGhanaNews.map((article, index) => (
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
          <Link href="/news?tab=ghana" className="text-sm text-gray-600 hover:underline block text-center">
            View all Ghana news →
          </Link>
        </>
      )}
    </div>
  )
}
