"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { FileText, Upload, Loader2, Copy, RefreshCw, AlertCircle, Bug } from "lucide-react"
import { pdfQaApi } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Message = {
  type: "question" | "response" | "system"
  text: string
  sources?: string[]
}

export default function ChatPdfPage() {
  const [messages, setMessages] = useState<Message[]>([
    { type: "system", text: "Upload a PDF and ask questions about its content." },
  ])
  const [input, setInput] = useState("")
  const [pdfUploaded, setPdfUploaded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem("pdfChatSession")
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        if (session.sessionId && session.fileName) {
          setSessionId(session.sessionId)
          setUploadedFileName(session.fileName)
          setPdfUploaded(true)
          setMessages([
            {
              type: "system",
              text: `Restored session for PDF "${session.fileName}". You can continue asking questions.`,
            },
          ])
          console.log("Restored session:", session)
        }
      } catch (err) {
        console.error("Failed to parse saved session:", err)
        localStorage.removeItem("pdfChatSession")
      }
    }
  }, [])

  // Save session to localStorage when it changes
  useEffect(() => {
    if (sessionId && uploadedFileName) {
      const session = {
        sessionId,
        fileName: uploadedFileName,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem("pdfChatSession", JSON.stringify(session))
      console.log("Saved session:", session)
    }
  }, [sessionId, uploadedFileName])

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Updated handleFileChange function for ChatPdfPage component
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (files && files.length > 0) {
    const file = files[0]

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    // Validate file size (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds maximum limit of 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
      return
    }

    setIsUploading(true)
    setError(null)
    setLastResponse(null)
    setUploadProgress(0)

    try {
      console.log(`Starting PDF upload: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)
      setUploadedFileName(file.name)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      // Upload the PDF
      const response = await pdfQaApi.uploadPdf(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Upload response:", response)
      setLastResponse(response)

      if (response.error) {
        throw new Error(response.message || "Failed to upload PDF")
      }

      // Check for warnings and display them in debug mode
      if (response.warning && debugMode) {
        console.warn("API Warning:", response.warning)
      }

      // Extract session ID using our improved logic
      let foundSessionId = response.extractedSessionId

      // If we found a session ID, store it
      if (foundSessionId) {
        setSessionId(foundSessionId)
        console.log("Session ID stored:", foundSessionId)
        
        // Immediately verify session by sending a test question
        try {
          const verificationResponse = await pdfQaApi.askQuestion("Verify this document is loaded correctly", foundSessionId)
          
          // If verification fails, show a warning but continue
          if (verificationResponse.error || 
             (verificationResponse.error_message && verificationResponse.error_message.includes("no documents"))) {
            console.warn("Session verification warning:", verificationResponse)
            setError("The document was uploaded, but the session verification had issues. Questions may not work correctly.")
          }
        } catch (verifyErr) {
          console.warn("Session verification error:", verifyErr)
        }
      } else {
        console.error("Could not find session_id in response:", JSON.stringify(response, null, 2))
        throw new Error("No session ID found in server response")
      }

      setPdfUploaded(true)
      setMessages([
        {
          type: "system",
          text: `PDF "${file.name}" uploaded successfully. You can now ask questions about its content.`,
        },
      ])
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "An error occurred while uploading the PDF")
      setMessages([{ type: "system", text: "There was an error uploading your PDF. Please try again." }])
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
}

// Updated handleSend function for ChatPdfPage component
const handleSend = async () => {
  if (!input.trim()) return
  if (!sessionId) {
    setError("Session ID is missing. Please upload a PDF first.")
    return
  }

  // Add user question to messages
  setMessages((prev) => [...prev, { type: "question", text: input }])

  // Store the question and clear input field
  const questionText = input.trim()
  setInput("")
  setIsProcessing(true)
  setError(null)
  setLastResponse(null)

  try {
    console.log("Sending question to API:", questionText)
    console.log("Using session ID:", sessionId)

    // Make the API call with the question and session ID
    const response = await pdfQaApi.askQuestion(questionText, sessionId)

    console.log("API response:", response)
    setLastResponse(response)

    if (response.error) {
      throw new Error(response.message || "Failed to get an answer")
    }

    // More comprehensive check for "no documents" error conditions
    if (
      response.has_documents === false ||
      response.document_count === 0 ||
      (response.error_message && response.error_message.includes("no documents")) ||
      (response.message && response.message.includes("no documents")) ||
      (typeof response.answer === 'string' && response.answer.toLowerCase().includes("no documents"))
    ) {
      // Try to recover the session with a re-upload
      setError(
        "The server reports no documents are associated with this session. Please click 'Retry Upload' to reconnect."
      )
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        { 
          type: "response", 
          text: "I'm having trouble accessing the document. Please try the 'Retry Upload' button to reconnect." 
        },
      ])
      
      return
    }

    // Update session ID if a new session token is provided
    if (response.session_info && response.session_info.session_token) {
      const newSessionToken = response.session_info.session_token
      if (newSessionToken !== sessionId) {
        console.log(`Updating session ID from ${sessionId} to ${newSessionToken}`)
        setSessionId(newSessionToken)
      }
    }

    // Extract the answer with better fallback options
    const answer = response.answer || 
                   response.response || 
                   response.result || 
                   response.message || 
                   "No answer provided"

    // Extract sources with better fallback options
    const sources = response.sources || 
                    (response.context && response.context.sources) || 
                    (response.metadata && response.metadata.sources) ||
                    []

    // Add the response to messages
    setMessages((prev) => [
      ...prev,
      {
        type: "response",
        text: answer,
        sources: sources,
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

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleReset = () => {
    setPdfUploaded(false)
    setUploadedFileName(null)
    setSessionId(null)
    setLastResponse(null)
    setMessages([{ type: "system", text: "Upload a PDF and ask questions about its content." }])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Clear the saved session
    localStorage.removeItem("pdfChatSession")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
  }

  const copyDebugInfo = () => {
    if (lastResponse) {
      const debugText = JSON.stringify(lastResponse, null, 2)
      navigator.clipboard
        .writeText(debugText)
        .then(() => {
          console.log("Debug info copied to clipboard")
        })
        .catch((err) => {
          console.error("Failed to copy debug info: ", err)
        })
    }
  }

  // New function to retry uploading the PDF
  const handleRetryUpload = () => {
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0) {
      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>)
    } else {
      handleUploadClick()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="h-12 w-12 mr-4 text-blue-600" />
              <h2 className="text-3xl font-bold">Chat with PDF</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} />
                <Label htmlFor="debug-mode" className="flex items-center">
                  <Bug className="h-4 w-4 mr-1" />
                  Debug
                </Label>
              </div>
              {pdfUploaded && (
                <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>{error}</span>
                {error.includes("no documents") && (
                  <Button variant="outline" size="sm" onClick={handleRetryUpload}>
                    Retry Upload
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {debugMode && lastResponse && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Debug Information</h3>
                <Button variant="outline" size="sm" onClick={copyDebugInfo}>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-800 text-gray-200 rounded">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}

          {!pdfUploaded ? (
            <div className="flex flex-col items-center justify-center mb-8 py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,.pdf"
                className="hidden"
              />
              <FileText className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-lg text-gray-500 mb-4">Upload a PDF to start asking questions</p>

              {isUploading && uploadProgress > 0 && (
                <div className="w-64 mb-4">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% uploaded</p>
                </div>
              )}

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
          ) : (
            <>
              {uploadedFileName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Current PDF: {uploadedFileName}</span>
                  </div>
                  {sessionId && (
                    <span className="text-xs text-blue-500">Session ID: {sessionId.substring(0, 8)}...</span>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-4 mb-6 max-h-[400px] overflow-y-auto p-4 bg-white rounded-lg shadow-inner">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === "question"
                        ? "justify-end"
                        : message.type === "system"
                          ? "justify-center"
                          : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-6 py-3 max-w-[80%] ${
                        message.type === "question"
                          ? "bg-blue-500 text-white"
                          : message.type === "system"
                            ? "bg-gray-100 text-gray-600 text-center"
                            : "bg-gray-200 text-black"
                      } relative group`}
                    >
                      <div>{message.text}</div>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
                          <strong>Sources:</strong>
                          <ul className="mt-1 list-disc pl-4">
                            {message.sources.map((source, idx) => (
                              <li key={idx} className="truncate max-w-[250px]">
                                {source.split("/").pop()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.type === "response" && message.text.length > 20 && (
                        <button
                          onClick={() => copyToClipboard(message.text)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </button>
                      )}
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

                <div ref={messagesEndRef} />
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
