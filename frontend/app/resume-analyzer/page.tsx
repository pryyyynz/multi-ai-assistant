"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { api } from "@/lib/api"
import { Loader2, Upload, FileText, Briefcase, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types for CV analysis response
interface CVData {
  name: string
  email: string
  phone: string
  skills: string[]
  education: {
    institution: string
    degree: string
    field: string | null
    dates: string
  }[]
  experience: {
    company: string
    position: string
    dates: string
    responsibilities: string[]
  }[]
  summary: string | null
}

interface Recommendations {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  keywords: string[]
  rating: number
}

interface MatchingJob {
  title: string
  url: string
  date_posted: string
  similarity_score: number
  description: string | null
}

interface CVAnalysisResponse {
  cv_data: CVData
  recommendations: Recommendations
  matching_jobs: MatchingJob[]
}

export default function ResumeAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CV file to upload")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await api.cvAnalyzer.analyzeCV(file)

      if (result.error) {
        setError(result.message)
      } else {
        setAnalysisResult(result)
      }
    } catch (err) {
      setError("Failed to analyze CV. Please try again.")
      console.error("CV analysis error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render star rating
  const renderRating = (rating: number) => {
    const stars = []
    const maxRating = 10

    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <Star key={i} className={`h-5 w-5 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />,
      )
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 font-medium">{rating}/10</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8 bg-white shadow-md">
          <div className="flex items-center justify-center mb-6">
            <div className="relative mr-4">
              <div className="h-16 w-16 border-2 border-gray-800 rounded flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-800" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Resume Analyzer</h2>
          </div>

          {!analysisResult ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-4">Upload your CV/resume for analysis</p>
                <input
                  type="file"
                  id="cv-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Select File
                </label>
                {file && (
                  <p className="mt-4 text-sm text-gray-600">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isLoading || !file}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    "Analyze CV"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="recommendations">CV Remarks</TabsTrigger>
                  <TabsTrigger value="jobs">Matching Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2 text-blue-800">CV Rating</h3>
                    {renderRating(analysisResult.recommendations.rating)}
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2 text-green-800">Strengths</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysisResult.recommendations.strengths.map((strength, index) => (
                        <li key={`strength-${index}`} className="text-green-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2 text-red-800">Areas for Improvement</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysisResult.recommendations.weaknesses.map((weakness, index) => (
                        <li key={`weakness-${index}`} className="text-red-700">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2 text-purple-800">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysisResult.recommendations.recommendations.map((recommendation, index) => (
                        <li key={`recommendation-${index}`} className="text-purple-700">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Key Skills & Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.recommendations.keywords.map((keyword, index) => (
                        <Badge key={`keyword-${index}`} variant="outline" className="bg-gray-100">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="jobs">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold mb-4">Suggested Jobs</h3>
                    {analysisResult.matching_jobs.map((job, index) => (
                      <div key={`job-${index}`} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xl font-bold text-blue-700">{job.title}</h4>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Match: {Math.round(job.similarity_score * 100)}%
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Posted: {job.date_posted}</p>
                        {job.description && (
                          <p className="mt-3 text-gray-700">{job.description.substring(0, 200)}...</p>
                        )}
                        <div className="mt-4">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            <Briefcase className="h-4 w-4 mr-1" /> View Job
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => {
                    setAnalysisResult(null)
                    setFile(null)
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Analyze Another CV
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
