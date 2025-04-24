import type React from "react"
import Link from "next/link"
import { Search, FileText, FileSearch, Cloud, BarChart2, ChevronDown } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-16">
        <div className="text-2xl font-bold">Multi AI Assistant</div>
        <div className="flex gap-8">
          <Link href="/" className="text-xl font-medium">
            Home
          </Link>
          <Link href="/tools" className="text-xl font-medium">
            Tools
          </Link>
          <Link href="/about" className="text-xl font-medium">
            About
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-12">Your smart Ghanaian AI Hub</h1>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Ask anything about Ghana"
            className="w-full py-3 px-4 rounded-full bg-gray-200 text-center"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
        <Link href="/chat-pdf">
          <FeatureCard
            icon={<FileText className="h-12 w-12 text-gray-700" />}
            title="PDF Q&A"
            description="Upload PDF and ask questions"
          />
        </Link>
        <Link href="/resume-analyzer">
          <FeatureCard
            icon={<FileSearch className="h-12 w-12 text-gray-700" />}
            title="Resume Analyzer"
            description="Get feedback on your resume"
          />
        </Link>
        <Link href="/weather">
          <FeatureCard
            icon={<Cloud className="h-12 w-12 text-gray-700" />}
            title="Weather Updates"
            description="View weather in Ghanaian cities"
          />
        </Link>
        <Link href="/data-explorer">
          <FeatureCard
            icon={<BarChart2 className="h-12 w-12 text-gray-700" />}
            title="CSV Explorer"
            description="Upload CSV files for data analysis"
          />
        </Link>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Trending News */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            <Link href="/news" className="hover:underline">
              Trending Ghanaian News
            </Link>
          </h2>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Tech News */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Tech and AI News</h2>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Weather */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            <Link href="/weather" className="hover:underline">
              Today's Weather
            </Link>
          </h2>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg">Accra</span>
              <ChevronDown className="h-5 w-5" />
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <Cloud className="h-12 w-12" />
              </div>
              <div>
                <div className="text-4xl font-bold">28°C</div>
                <div className="text-gray-600">Partly cloudy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
