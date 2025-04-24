"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"

export default function ResumeAnalyzerPage() {
  const [resumeUploaded, setResumeUploaded] = useState(false)

  const handleUpload = () => {
    setResumeUploaded(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-3xl mx-auto mt-8">
        <Card className="p-8 bg-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="relative mr-4">
              <div className="h-16 w-16 border-2 border-black rounded"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                <div className="h-8 w-8 border-t-2 border-l-2 border-r-2 border-black rounded-t-lg"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold">Resume Analyzer</h2>
          </div>

          <div className="flex justify-center mb-8">
            <Button onClick={handleUpload} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 text-xl">
              Upload CV
            </Button>
          </div>

          {resumeUploaded && (
            <div className="space-y-4">
              <h3 className="text-3xl font-bold mb-4">Suggested Jobs</h3>
              {[1, 2, 3].map((job) => (
                <div key={job} className="bg-gray-200 p-4 rounded">
                  <h4 className="text-2xl font-bold">Software Developer</h4>
                  <p className="text-xl">ABC Tech</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
