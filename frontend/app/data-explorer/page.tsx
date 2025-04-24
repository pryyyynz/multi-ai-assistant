"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"

export default function DataExplorerPage() {
  const [dataUploaded, setDataUploaded] = useState(false)

  const handleUpload = () => {
    setDataUploaded(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Left Panel */}
        <Card className="p-8 bg-gray-200">
          <div className="flex flex-col items-center">
            <Button
              onClick={handleUpload}
              className="mb-8 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-xl"
            >
              Upload dataset
            </Button>

            {dataUploaded && (
              <>
                <div className="text-center mb-8 text-xl">
                  <h2 className="font-bold text-2xl mb-4">
                    Found the following problems in your dataset and did the following to clean it
                  </h2>
                  <div className="space-y-4 mb-8">
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                  <Button className="bg-white text-black hover:bg-gray-100 mb-8">Download clean data</Button>
                </div>
                <Button className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-4 text-xl rounded-full">
                  Anything more?
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Right Panel */}
        <Card className="p-8 bg-gray-200">
          <div className="flex flex-col items-center">
            <Button
              onClick={handleUpload}
              className="mb-8 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-xl"
            >
              Upload dataset
            </Button>

            {dataUploaded && (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-bold text-3xl mb-8">Some plots generated from your dataset</h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                    <div className="h-24 bg-teal-200 rounded-full"></div>
                  </div>
                </div>
                <Button className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-4 text-xl rounded-full">
                  Anything more?
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
