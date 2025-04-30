"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { FileText, Upload, Loader2 } from "lucide-react"
import { pdfQaApi } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatPdfPage() {
  const [messages, setMessages] = useState<{ type: "question" | "response"; text: string }[]>([
    { type: "response", text: "Upload a PDF and ask questions about its content." },
  ])
  const [input, setInput] = useState("")
  const [pdfUploaded, setPdfUploaded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update the handleFileChange function to better handle errors
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Validate file type
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file")
        return
      }

      setIsUploading(true)
      setError(null)

      try {
        console.log("Starting PDF upload:", file.name)
        const response = await pdfQaApi.uploadPdf(file)

        console.log("Upload response:", response)

        if (response.error) {
          throw new Error(response.message || "Failed to upload PDF")
        }

        setPdfUploaded(true)
        setMessages([
          { type: "response", text: "PDF uploaded successfully. You can now ask questions about its content." },
        ])
      } catch (err: any) {
        console.error("Upload error:", err)
        setError(err.message || "An error occurred while uploading the PDF")
        setMessages([{ type: "response", text: "There was an error uploading your PDF. Please try again." }])
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Update the handleSend function to ensure we're logging the exact payload being sent
  // and handling the response correctly

  const handleSend = async () => {
    if (input.trim()) {
      // Add user question to messages
      setMessages([...messages, { type: "question", text: input }])

      // Store the question and clear input field
      const questionText = input.trim()
      setInput("")
      setIsProcessing(true)
      setError(null)

      try {
        console.log("Sending question to API:", questionText)

        // Make the API call with the question
        const response = await pdfQaApi.askQuestion(questionText)

        console.log("API response:", response)

        if (response.error) {
          throw new Error(response.message || "Failed to get an answer")
        }

        // Add the response to messages
        setMessages((prev) => [
          ...prev,
          {
            type: "response",
            text: response.answer || response.response || "No answer provided",
          },
        ])
      } catch (err: any) {
        console.error("Question error:", err)
        setError(err.message || "An error occurred while processing your question")
        setMessages((prev) => [
          ...prev,
          { type: "response", text: "Sorry, I couldn't process your question. Please try again." },
        ])
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8 bg-gray-50">
          <div className="flex items-center mb-6">
            <FileText className="h-12 w-12 mr-4 text-blue-600" />
            <h2 className="text-3xl font-bold">Chat with PDF</h2>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-8">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload PDF
                </>
              )}
            </Button>
          </div>

          {pdfUploaded && (
            <>
              <div className="flex flex-col space-y-4 mb-6 max-h-[400px] overflow-y-auto p-4 bg-white rounded-lg shadow-inner">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "question" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-2xl px-6 py-3 max-w-[80%] ${
                        message.type === "question" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-6 py-3 bg-gray-200 text-black">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing your question...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the PDF..."
                  className="w-full py-4 px-6 rounded-full bg-white border border-gray-300 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend()
                  }}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 px-6"
                  disabled={isProcessing || !input.trim()}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
