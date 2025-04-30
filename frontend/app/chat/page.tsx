"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import NavBar from "@/components/nav-bar"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"

export default function ChatPage() {
  const [messages, setMessages] = useState<{ type: "question" | "response"; text: string }[]>([
    {
      type: "response",
      text: "Hello! I'm your Ghana AI Assistant. Ask me anything about Ghana's history, culture, landmarks, or current events.",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isError, setIsError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message to chat
      const userMessage = input.trim()
      setMessages((prev) => [...prev, { type: "question", text: userMessage }])
      setInput("")
      setIsTyping(true)
      setIsError(false)

      try {
        // Try multiple API methods with fallback to simulation
        let response

        try {
          // Try the first authentication method
          response = await api.ghanaChat.sendMessage(userMessage)
        } catch (error1) {
          console.warn("First API method failed:", error1)

          try {
            // Try the alternative authentication method
            response = await api.ghanaChat.sendMessageAlt(userMessage)
          } catch (error2) {
            console.warn("Alternative API method failed:", error2)

            // Fall back to simulation if both API calls fail
            console.log("Falling back to simulation mode")
            response = await api.ghanaChat.simulateResponse(userMessage)
          }
        }

        setIsTyping(false)

        // Check if response has the expected format
        if (response && response.response) {
          setMessages((prev) => [
            ...prev,
            {
              type: "response",
              text: response.response,
            },
          ])
        } else if (response && response.text) {
          // Fallback if response is in a different format
          setMessages((prev) => [
            ...prev,
            {
              type: "response",
              text: response.text,
            },
          ])
        } else {
          // Handle unexpected response format
          setMessages((prev) => [
            ...prev,
            {
              type: "response",
              text: "I received your message, but I'm having trouble generating a proper response. Please try again.",
            },
          ])
        }
      } catch (error) {
        console.error("Error sending message:", error)
        setIsTyping(false)
        setIsError(true)
        setMessages((prev) => [
          ...prev,
          {
            type: "response",
            text: "Sorry, I encountered an error while processing your request. Please try again later.",
          },
        ])
      }
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <h1 className="text-2xl font-bold">Ghana Chat</h1>
            <p className="text-blue-100">Ask questions about Ghana's history, culture, and more</p>
          </div>

          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${message.type === "question" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.type === "question"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex justify-center mb-4">
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 shadow-sm text-sm">
                    Error connecting to Ghana Chat. Please try again.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about Ghana..."
                  className="w-full py-3 px-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend()
                  }}
                />
                <Button
                  onClick={handleSend}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
                  disabled={isTyping}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
