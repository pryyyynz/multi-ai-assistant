import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { getHomePageTechNews } from "@/lib/news-utils"
import Image from "next/image"
import { useState, useEffect } from "react"

// Create a Client Component for the Image with error handling
"use client"
function NewsImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src)
  
  // Reset the image source if src prop changes
  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="64px"
      className={className}
      onError={() => setImgSrc("/placeholder.svg?height=64&width=64")}
    />
  )
}

// Back to Server Component code
export async function HomeTechNews() {
  const articles = await getHomePageTechNews()

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
        <Link href={article.url} target="_blank" rel="noopener noreferrer" key={index} className="block">
          <div className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start gap-3">
              {article.imageUrl && (
                <div className="flex-shrink-0 w-16 h-16 relative overflow-hidden rounded-md">
                  <NewsImage
                    src={article.imageUrl || "/placeholder.svg?height=64&width=64"}
                    alt={article.title}
                    className="object-cover"
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
      ))}
      <Link href="/news?tab=tech" className="text-sm text-blue-600 hover:underline block text-center">
        View all tech news →
      </Link>
    </div>
  )
}
