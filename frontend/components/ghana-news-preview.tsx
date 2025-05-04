import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchGhanaNews } from "@/app/news/actions"

interface GhanaNewsPreviewProps {
  limit?: number
}

export default async function GhanaNewsPreview({ limit = 6 }: GhanaNewsPreviewProps) {
  const data = await fetchGhanaNews()
  const articles = data?.articles || []

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

  if (!articles.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ghana News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ghana News</h2>
        <Link href="/news" passHref>
          <Button variant="outline">View All</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, limit).map((article, index) => (
          <Card key={index} className="flex flex-col h-full overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={article.imageUrl || "/placeholder.svg?height=200&width=300"}
                alt={article.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
              />
            </div>
            <CardHeader className="flex-grow">
              <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
              <CardDescription>{formatDate(article.pubDate)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{article.description}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {article.category &&
                article.category.slice(0, 3).map((cat, i) => (
                  <Badge key={i} variant="outline" className="mr-1">
                    {cat}
                  </Badge>
                ))}
            </CardFooter>
            <CardFooter>
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full">
                  Read More
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
