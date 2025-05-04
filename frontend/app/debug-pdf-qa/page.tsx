"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { Loader2, Bug, RefreshCw, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPdfQaPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const questionInputRef = useRef<HTMLInputElement>(null)
  const sessionIdInputRef = useRef<HTMLInputElement>(null)
  const useProxyRef = useRef<HTMLInputElement>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const copyLogs = () => {
    const logText = logs.join("\n")
    navigator.clipboard
      .writeText(logText)
      .then(() => {
        addLog("Logs copied to clipboard")
      })
      .catch((err) => {
        addLog(`Failed to copy logs: ${err.message}`)
      })
  }

  const handleFileUpload = async () => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) {
      setError("Please select a PDF file first")
      return
    }

    const file = files[0]
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setError(null)
    addLog(`Starting upload of file: ${file.name}`)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Check if we should use the proxy
      const useProxy = useProxyRef.current?.checked ?? true
      const endpoint = useProxy
        ? "/api/pdf-proxy/upload"
        : "https://multi-ai-assistant-production.up.railway.app/upload-qa"

      addLog(`Using ${useProxy ? "proxy" : "direct"} endpoint: ${endpoint}`)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: useProxy ? "same-origin" : "include",
      })

      addLog(`Upload response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error response: ${errorText}`)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      addLog(`Upload successful, response: ${JSON.stringify(data, null, 2)}`)

      // Check for session_id
      if (data.session_id) {
        setSessionId(data.session_id)
        if (sessionIdInputRef.current) {
          sessionIdInputRef.current.value = data.session_id
        }
        addLog(`Session ID received: ${data.session_id}`)
      } else {
        addLog(`Warning: No session_id in response`)
      }

      // Check for session_info
      if (data.session_info) {
        addLog(
          `Session info: document_count=${data.session_info.document_count || "N/A"}, has_vector_store=${data.session_info.has_vector_store || "N/A"}`,
        )
      } else {
        addLog(`Warning: No session_info in response`)
      }
    } catch (err: any) {
      addLog(`Upload error: ${err.message}`)
      setError(err.message || "An error occurred while uploading the PDF")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAskQuestion = async () => {
    const question = questionInputRef.current?.value
    if (!question) {
      setError("Please enter a question")
      return
    }

    // Get the session ID from the input field
    const currentSessionId = sessionIdInputRef.current?.value || sessionId

    if (!currentSessionId) {
      setError("Session ID is required. Please upload a PDF first or enter a session ID manually.")
      return
    }

    setIsQuerying(true)
    setError(null)
    addLog(`Sending question: ${question}`)
    addLog(`Using session ID: ${currentSessionId}`)

    try {
      const formData = new FormData()
      formData.append("question", question)
      formData.append("session_id", currentSessionId)

      // Check if we should use the proxy
      const useProxy = useProxyRef.current?.checked ?? true
      const endpoint = useProxy ? "/api/pdf-proxy/ask" : "https://multi-ai-assistant-production.up.railway.app/ask-qa"

      addLog(`Using ${useProxy ? "proxy" : "direct"} endpoint: ${endpoint}`)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: useProxy ? "same-origin" : "include",
      })

      addLog(`Question response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error response: ${errorText}`)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      addLog(`Question successful, response: ${JSON.stringify(data, null, 2)}`)
    } catch (err: any) {
      addLog(`Question error: ${err.message}`)
      setError(err.message || "An error occurred while processing your question")
    } finally {
      setIsQuerying(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Bug className="h-12 w-12 mr-4 text-red-600" />
              <h2 className="text-3xl font-bold">Debug PDF Q&A</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyLogs} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Logs
              </Button>
              <Button variant="outline" onClick={clearLogs} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useProxy"
                ref={useProxyRef}
                defaultChecked={true}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useProxy" className="ml-2 block text-sm text-blue-700">
                Use Next.js API proxy (recommended to avoid CORS issues)
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">1. Upload PDF</h3>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <Button onClick={handleFileUpload} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">2. Session ID</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                ref={sessionIdInputRef}
                placeholder="Session ID (automatically filled after upload)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={sessionId || ""}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will be automatically filled after uploading a PDF, or you can enter it manually if you have one.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">3. Ask Question</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                ref={questionInputRef}
                placeholder="Enter your question about the PDF..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleAskQuestion} disabled={isQuerying} className="bg-blue-600 hover:bg-blue-700">
                {isQuerying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asking...
                  </>
                ) : (
                  "Ask"
                )}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Debug Logs</h3>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <p>No logs yet. Upload a PDF and ask questions to see debug information.</p>
              ) : (
                logs.map((log, index) => <div key={index}>{log}</div>)
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
