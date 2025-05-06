"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

// Define an interface for the article object
interface Article {
  url: string
  imageUrl?: string
  title: string
  source: {
    name: string
  }
  formattedDate: string
}

// Add the type annotation to the component props
export function NewsArticleClient({ article }: { article: Article }) {
  return (
    <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block">
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
              <span>{article.source.name}</span>
              <span>{article.formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}