"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import NavBar from "@/components/nav-bar"
import { Send, Bot, User, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
}

// Sample template messages for quick access
const templateMessages = [
  "Tell me about Ghana's history",
  "What are traditional Ghanaian foods?",
  "Explain Ghana's political system",
  "What are the major festivals in Ghana?",
  "Tell me about Ghana's economy",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Get query from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get("query")
    if (query) {
      handleSend(query)
    }
  }, [])

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return

    // Add user message to chat
    const userMessage: Message = { role: "user", content: messageText }
    setMessages((prev) => [...prev, userMessage])

    // Clear input and show loading
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Call API
      const response = await fetch("/api/ghana-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || data.response || data.text || "I'm sorry, I couldn't process that request.",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-4 md:p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Ghana Chat</h1>
          <p className="text-gray-600">Ask me anything about Ghana's history, culture, economy, politics, and more.</p>
        </Card>

        {/* Template messages for quick access */}
        <div className="mb-6 flex flex-wrap gap-2">
          {templateMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs md:text-sm"
              onClick={() => handleSend(message)}
            >
              {message}
            </Button>
          ))}
        </div>

        {/* Chat messages */}
        <div className="bg-white border rounded-lg p-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <Bot className="h-16 w-16 mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Welcome to Ghana Chat!</h3>
              <p className="max-w-md">
                Ask me anything about Ghana's history, culture, economy, politics, and more. I'm here to help!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === "assistant" ? (
                        <Bot className="h-5 w-5 mr-1" />
                      ) : (
                        <User className="h-5 w-5 mr-1" />
                      )}
                      <span className="font-medium">{message.role === "user" ? "You" : "Ghana AI"}</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 rounded-tl-none">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 mr-1" />
                      <span className="font-medium">Ghana AI</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-100 text-red-800 rounded-lg p-3 text-center">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-red-800 border-red-800 hover:bg-red-200"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
