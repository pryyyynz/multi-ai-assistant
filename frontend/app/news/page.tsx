"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import NavBar from "@/components/nav-bar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { getTechNews, formatPublishedDate, type NewsArticle, fallbackGhanaNews, fallbackTechNews } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"

interface GhanaNewsArticle {
  title: string
  link: string
  keywords: string[] | null
  creator: string[] | string | null
  video_url: string | null
  description: string | null
  content: string | null
  pubDate: string
  image_url: string | null
  source_id: string
  source_name: string
  category: string[] | null
  country: string[] | null
  language: string
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "ghana"
  const [activeTab, setActiveTab] = useState(initialTab)

  // Initialize with empty arrays to prevent undefined errors
  const [techNews, setTechNews] = useState<NewsArticle[]>([])
  const [ghanaNews, setGhanaNews] = useState<GhanaNewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch news when the component mounts or when the tab changes
  useEffect(() => {
    let isMounted = true
    let retryTimeout: NodeJS.Timeout

    async function fetchNews() {
      if (!isMounted) return

      setLoading(true)
      setError(null)

      try {
        if (activeTab === "tech") {
          // For tech news, use the server action
          const response = await getTechNews()
          if (isMounted) {
            if (response && response.status === "ok") {
              setTechNews(response.articles || [])
            } else {
              setError("Failed to fetch tech news")
              // Use fallback data
              setTechNews(fallbackTechNews.articles || [])
            }
          }
        } else if (activeTab === "ghana") {
          // For Ghana news, implement client-side fetching with retry logic
          try {
            // Use the direct API call with the provided key
            const apiKey = "pub_83090774cc754e5d50929e8969c84f48fdf66"
            const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en&country=gh&category=business,domestic,education,entertainment,politics`

            const response = await fetch(url)

            if (!response.ok) {
              // If we hit rate limits, use fallback data
              if (response.status === 429) {
                console.warn("Rate limited by Ghana News API, using fallback data")
                if (isMounted) {
                  setGhanaNews(fallbackGhanaNews.results || [])
                  setError("API rate limit reached. Showing cached news.")
                }
              } else {
                throw new Error(`Failed with status: ${response.status}`)
              }
            } else {
              const data = await response.json()
              if (isMounted && data && data.status === "success") {
                setGhanaNews(data.results || [])
                // Store in sessionStorage as a simple client-side cache
                sessionStorage.setItem(
                  "ghana-news-cache",
                  JSON.stringify({
                    data: data.results || [],
                    timestamp: Date.now(),
                  }),
                )
              } else {
                throw new Error("Invalid data format")
              }
            }
          } catch (err) {
            console.error("Error fetching Ghana news:", err)

            // Try to use cached data from sessionStorage
            const cachedData = sessionStorage.getItem("ghana-news-cache")
            if (cachedData) {
              try {
                const { data, timestamp } = JSON.parse(cachedData)
                // Use cached data if it's less than 2 hours old
                if (Date.now() - timestamp < 7200000) {
                  if (isMounted) {
                    setGhanaNews(data || [])
                    setError("Using cached news. Latest news unavailable.")
                  }
                  return
                }
              } catch (e) {
                console.error("Error parsing cached data:", e)
              }
            }

            // If no cache or expired cache, use fallback data
            if (isMounted) {
              setGhanaNews(fallbackGhanaNews.results || [])
              setError("Unable to fetch news. Showing sample content.")
            }
          }
        }
      } catch (err: any) {
        console.error(`Error fetching ${activeTab} news:`, err)
        if (isMounted) {
          setError(`Error fetching ${activeTab} news. ${err.message || ""}`)

          // Use fallback data based on the active tab
          if (activeTab === "tech") {
            setTechNews(fallbackTechNews.articles || [])
          } else {
            setGhanaNews(fallbackGhanaNews.results || [])
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchNews()

    // Cleanup function
    return () => {
      isMounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [activeTab, retryCount])

  // Function to handle retry with exponential backoff
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-5xl mx-auto mt-8">
        <h1 className="text-4xl font-bold mb-6">News</h1>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 flex items-center justify-between">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="ghana" className="text-lg px-6">
              Ghana News
            </TabsTrigger>
            <TabsTrigger value="tech" className="text-lg px-6">
              AI & Tech News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ghana" className="space-y-8">
            {loading ? (
              // Loading skeletons for Ghana news
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-ghana-${index}`} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-48" />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </Card>
              ))
            ) : ghanaNews && ghanaNews.length > 0 ? (
              ghanaNews.map((article, index) => (
                <Card key={`ghana-${index}`} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Image
                        src={article.image_url || "/placeholder.svg?height=200&width=300"}
                        alt={article.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                      <div className="text-gray-600 mb-4">
                        {article.source_name} · {formatPublishedDate(article.pubDate)}
                      </div>
                      <p className="text-gray-700 mb-4">{article.description || "No description available"}</p>
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {article.category &&
                          article.category.map((cat, i) => (
                            <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {cat}
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          className="mt-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(article.link, "_blank")}
                        >
                          Read More
                        </Button>
                        {article.creator && (
                          <span className="text-sm text-gray-500">
                            By: {Array.isArray(article.creator) ? article.creator.join(", ") : article.creator}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No Ghana news available</p>
                <Button onClick={handleRetry} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tech" className="space-y-8">
            {loading ? (
              // Loading skeletons for tech news
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-tech-${index}`} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-48" />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </Card>
              ))
            ) : techNews && techNews.length > 0 ? (
              techNews.map((article, index) => (
                <Card key={`tech-${index}`} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Image
                        src={article.urlToImage || "/placeholder.svg?height=200&width=300"}
                        alt={article.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                      <div className="text-gray-600 mb-4">
                        {article.source.name} · {article.author ? `${article.author} · ` : ""}
                        {formatPublishedDate(article.publishedAt)}
                      </div>
                      <p className="text-gray-700">{article.description}</p>
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open(article.url, "_blank")}
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tech news available</p>
                <Button onClick={handleRetry} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" className="px-8" onClick={handleRetry}>
            Refresh News
          </Button>
        </div>
      </div>
    </div>
  )
}
