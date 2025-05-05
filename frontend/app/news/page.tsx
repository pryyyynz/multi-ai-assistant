"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import NavBar from "@/components/nav-bar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface GhanaNewsArticle {
  title: string
  link: string
  pubDate: string
  description: string
  category?: string[]
  imageUrl?: string
  source_name?: string
}

interface TechNewsArticle {
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
  content: string | null
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "ghana"
  const [activeTab, setActiveTab] = useState(initialTab)

  // Initialize with empty arrays to prevent undefined errors
  const [techNews, setTechNews] = useState<TechNewsArticle[]>([])
  const [ghanaNews, setGhanaNews] = useState<GhanaNewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Fetch news when the component mounts or when the tab changes
  useEffect(() => {
    let isMounted = true

    async function fetchNews() {
      if (!isMounted) return

      setLoading(true)
      setError(null)

      try {
        if (activeTab === "tech") {
          // Check if we have cached tech news data in sessionStorage
          const cachedData = sessionStorage.getItem("tech-news-cache")
          if (cachedData) {
            try {
              const { data, timestamp } = JSON.parse(cachedData)
              // Use cached data if it's less than 4 hours old
              if (Date.now() - timestamp < 4 * 60 * 60 * 1000) {
                if (isMounted) {
                  setTechNews(data.articles || [])
                  setLoading(false)
                  return
                }
              }
            } catch (e) {
              console.error("Error parsing cached tech news data:", e)
            }
          }

          const response = await fetch("/api/tech-news")

          if (!response.ok) {
            throw new Error(`Failed to fetch tech news: ${response.status}`)
          }

          const data = await response.json()

          if (isMounted) {
            if (data && data.status === "ok" && data.articles && data.articles.length > 0) {
              setTechNews(data.articles)
              // Store in sessionStorage as a simple client-side cache
              sessionStorage.setItem(
                "tech-news-cache",
                JSON.stringify({
                  data,
                  timestamp: Date.now(),
                }),
              )
            } else {
              throw new Error("Invalid or empty response from tech news API")
            }
          }
        } else if (activeTab === "ghana") {
          // Check if we have cached Ghana news data in sessionStorage
          const cachedData = sessionStorage.getItem("ghana-news-cache")
          if (cachedData) {
            try {
              const { data, timestamp } = JSON.parse(cachedData)
              // Use cached data if it's less than 2 hours old
              if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
                if (isMounted) {
                  setGhanaNews(data.articles || [])
                  setLoading(false)
                  return
                }
              }
            } catch (e) {
              console.error("Error parsing cached Ghana news data:", e)
            }
          }

          const response = await fetch("/api/ghana-news")

          if (!response.ok) {
            throw new Error(`Failed to fetch Ghana news: ${response.status}`)
          }

          const data = await response.json()

          if (isMounted) {
            if (data && data.articles && data.articles.length > 0) {
              setGhanaNews(data.articles)
              // Store in sessionStorage as a simple client-side cache
              sessionStorage.setItem(
                "ghana-news-cache",
                JSON.stringify({
                  data,
                  timestamp: Date.now(),
                }),
              )
            } else {
              throw new Error("No articles found in Ghana news")
            }
          }
        }
      } catch (err: any) {
        console.error(`Error fetching ${activeTab} news:`, err)

        if (isMounted) {
          setError(`Unable to fetch news. ${err.message || "Showing sample content."}`)

          // Try to use cached data from sessionStorage
          if (activeTab === "ghana") {
            const cachedData = sessionStorage.getItem("ghana-news-cache")
            if (cachedData) {
              try {
                const { data, timestamp } = JSON.parse(cachedData)
                // Use cached data if it's less than 24 hours old (for fallback)
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                  setGhanaNews(data.articles || [])
                  setError("Using cached news. Latest news unavailable.")
                  setLoading(false)
                  return
                }
              } catch (e) {
                console.error("Error parsing cached data:", e)
              }
            }

            // If no cache or expired cache, use fallback data
            setGhanaNews([
              {
                title: "Ghana's Economy Shows Strong Growth in Q2 2025",
                link: "https://example.com/ghana-economy",
                pubDate: "2025-04-28T14:30:00Z",
                description:
                  "Ghana's economy has shown remarkable resilience with a 5.8% growth in the second quarter of 2025.",
                category: ["Business"],
                imageUrl: "/placeholder.svg?height=200&width=300",
                source_name: "Ghana News",
              },
              {
                title: "New Educational Reforms Announced by Ghana's Ministry of Education",
                link: "https://example.com/ghana-education",
                pubDate: "2025-04-27T09:15:00Z",
                description:
                  "The Ministry of Education has announced comprehensive reforms aimed at improving educational outcomes.",
                category: ["News"],
                imageUrl: "/placeholder.svg?height=200&width=300",
                source_name: "Ghana News",
              },
            ])
          } else {
            // Try to use cached tech news data
            const cachedData = sessionStorage.getItem("tech-news-cache")
            if (cachedData) {
              try {
                const { data, timestamp } = JSON.parse(cachedData)
                // Use cached data if it's less than 24 hours old (for fallback)
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                  setTechNews(data.articles || [])
                  setError("Using cached news. Latest news unavailable.")
                  setLoading(false)
                  return
                }
              } catch (e) {
                console.error("Error parsing cached data:", e)
              }
            }

            // Fallback for tech news
            setTechNews([
              {
                source: { id: "wired", name: "Wired" },
                author: "Chris Baraniuk",
                title: "The Climate Crisis Threatens Supply Chains. Manufacturers Hope AI Can Help",
                description:
                  "The Covid-19 pandemic showed just how vulnerable global supply chains are. Climate shocks could pose an even greater risk.",
                url: "https://www.wired.com/story/manufacturers-hope-ai-will-save-supply-chains-from-climate-crisis/",
                urlToImage:
                  "https://media.wired.com/photos/67bde52c1171429c58ee8b3f/191:100/w_1280,c_limit/022425_Climate-Crisis-Supply-Chain.jpg",
                publishedAt: "2025-05-02T10:00:00Z",
                content:
                  "Abhi Ghadge, associate professor of supply chain management at Cranfield University in the UK, says there has been a general kind of negligence in terms of climate resilience, though that is beginning to change.",
              },
              {
                source: { id: "the-verge", name: "The Verge" },
                author: "Chris Welch",
                title: "Apple doesn't seem too worried about Trump's tariffs",
                description:
                  "Apple reported its latest quarterly earnings on Wednesday under the backdrop of a court ruling that's poised to upend the company's App Store business and tariff uncertainty that could spur price increases for devices including the iPhone.",
                url: "https://www.theverge.com/news/659650/apple-q2-2025-earnings-tariffs-app-store",
                urlToImage: "/placeholder.svg?height=200&width=300",
                publishedAt: "2025-05-01T18:30:00Z",
                content:
                  "Apple reported strong quarterly earnings despite concerns about potential tariffs and App Store changes.",
              },
            ])
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
    }
  }, [activeTab])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">News</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full">
            <TabsTrigger value="ghana" className="text-base md:text-lg px-4 md:px-6 w-1/2">
              Ghana News
            </TabsTrigger>
            <TabsTrigger value="tech" className="text-base md:text-lg px-4 md:px-6 w-1/2">
              AI & Tech News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ghana">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={`skeleton-ghana-${index}`} className="overflow-hidden flex flex-col h-full">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))
              ) : ghanaNews.length > 0 ? (
                ghanaNews.map((article, index) => (
                  <Card key={`ghana-${index}`} className="overflow-hidden flex flex-col h-full">
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={article.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h2>
                      <div className="text-gray-600 mb-2 text-sm">
                        {article.source_name || "Ghana News"} · {formatDate(article.pubDate)}
                      </div>
                      <p className="text-gray-700 mb-4 text-sm flex-grow line-clamp-3">{article.description}</p>

                      {article.category && article.category.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.category.slice(0, 3).map((cat, i) => (
                            <Badge key={i} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button className="mt-auto w-full" onClick={() => window.open(article.link, "_blank")}>
                        Read More
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No Ghana news available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tech">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={`skeleton-tech-${index}`} className="overflow-hidden flex flex-col h-full">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))
              ) : techNews.length > 0 ? (
                techNews.map((article, index) => (
                  <Card key={`tech-${index}`} className="overflow-hidden flex flex-col h-full">
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.urlToImage || "/placeholder.svg?height=200&width=300"}
                        alt={article.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h2>
                      <div className="text-gray-600 mb-2 text-sm">
                        {article.source.name} · {formatDate(article.publishedAt)}
                      </div>
                      <p className="text-gray-700 mb-4 text-sm flex-grow line-clamp-3">{article.description}</p>

                      {article.author && <div className="text-sm text-gray-500 mb-4">By: {article.author}</div>}

                      <Button className="mt-auto w-full" onClick={() => window.open(article.url, "_blank")}>
                        Read More
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No tech news available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
