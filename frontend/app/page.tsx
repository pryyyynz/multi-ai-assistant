import { Suspense } from "react"
import Link from "next/link"
import { Search, FileText, FileSearch, CloudIcon, BarChart2, PenTool } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { HomeTechNews } from "@/components/home-tech-news"
import { HomeNews } from "@/components/home-news"
import { WeatherWidget } from "@/components/weather-widget"
import { FeatureCard } from "@/components/feature-card"
import NavBar from "@/components/nav-bar"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-12">Your smart Ghanaian AI Hub</h1>

        {/* Search Bar */}
        <form action="/chat" method="get" className="relative max-w-xl mx-auto">
          <input
            type="text"
            name="query"
            placeholder="Ask anything about Ghana"
            className="w-full py-3 px-4 rounded-full bg-gray-200 text-center"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer"
          >
            <Search className="h-6 w-6" />
          </button>
        </form>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-12 md:mb-16">
        <Link href="/chat-pdf" className="block">
          <FeatureCard
            icon={<FileText className="h-8 md:h-12 w-8 md:w-12 text-gray-700" />}
            title="PDF Q&A"
            description="Upload PDF and ask questions"
          />
        </Link>
        <Link href="/resume-analyzer" className="block">
          <FeatureCard
            icon={<FileSearch className="h-8 md:h-12 w-8 md:w-12 text-gray-700" />}
            title="Resume Analyzer"
            description="Get feedback on your resume"
          />
        </Link>
        <Link href="/weather" className="block">
          <FeatureCard
            icon={<CloudIcon className="h-8 md:h-12 w-8 md:w-12 text-gray-700" />}
            title="Weather Updates"
            description="View weather in Ghanaian cities"
          />
        </Link>
        <Link href="/data-explorer" className="block">
          <FeatureCard
            icon={<BarChart2 className="h-8 md:h-12 w-8 md:w-12 text-gray-700" />}
            title="CSV Explorer"
            description="Upload CSV files for data analysis"
          />
        </Link>
        <Link href="/cover-letter-generator" className="block">
          <FeatureCard
            icon={<PenTool className="h-8 md:h-12 w-8 md:w-12 text-gray-700" />}
            title="Cover Letter Generator"
            description="Create tailored cover letters"
          />
        </Link>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Trending News */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            <Link href="/news?tab=ghana" className="hover:underline flex items-center">
              Trending Ghanaian News
            </Link>
          </h2>
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            }
          >
    
            <HomeNews />
          </Suspense>
        </div>

        {/* Tech News */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            <Link href="/news?tab=tech" className="hover:underline flex items-center">
              Tech and AI News
            </Link>
          </h2>
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            }
          >
            <HomeTechNews />
          </Suspense>
        </div>

        {/* Weather */}
        <div className="md:col-span-2 lg:col-span-1">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            <Link href="/weather" className="hover:underline">
              Today's Weather
            </Link>
          </h2>
          <WeatherWidget />
        </div>
      </div>
    </div>
  )
}
