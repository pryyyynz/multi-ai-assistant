import type React from "react"
import Link from "next/link"
import { FileText, FileSearch, Cloud, BarChart2, PenTool } from "lucide-react"
import NavBar from "@/components/nav-bar"

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-12 text-center">Ghana AI Tools</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/chat">
            <ToolCard
              icon={<Cloud className="h-16 w-16 text-gray-700" />}
              title="Ghana Chat"
              description="Ask questions about Ghana's history, culture, and more"
            />
          </Link>

          <Link href="/chat-pdf">
            <ToolCard
              icon={<FileText className="h-16 w-16 text-gray-700" />}
              title="PDF Q&A"
              description="Upload PDF and ask questions about the content"
            />
          </Link>

          <Link href="/resume-analyzer">
            <ToolCard
              icon={<FileSearch className="h-16 w-16 text-gray-700" />}
              title="Resume Analyzer"
              description="Get feedback on your resume and job suggestions"
            />
          </Link>

          <Link href="/data-explorer">
            <ToolCard
              icon={<BarChart2 className="h-16 w-16 text-gray-700" />}
              title="CSV Explorer"
              description="Upload CSV files for data analysis and visualization"
            />
          </Link>

          <Link href="/news">
            <ToolCard
              icon={<Cloud className="h-16 w-16 text-gray-700" />}
              title="Ghana News"
              description="Stay updated with the latest news from Ghana"
            />
          </Link>

          <Link href="/weather">
            <ToolCard
              icon={<Cloud className="h-16 w-16 text-gray-700" />}
              title="Weather Updates"
              description="Check weather forecasts for cities across Ghana"
            />
          </Link>

          <Link href="/resume-builder">
            <ToolCard
              icon={<FileText className="h-16 w-16 text-gray-700" />}
              title="Resume Builder"
              description="Create and download professional resumes with customizable templates"
            />
          </Link>

          <Link href="/cover-letter-generator">
            <ToolCard
              icon={<PenTool className="h-16 w-16 text-gray-700" />}
              title="Cover Letter Generator"
              description="Generate tailored cover letters for job applications"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ToolCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border rounded-lg p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow h-full">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
