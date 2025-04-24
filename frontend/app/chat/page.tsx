"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import NavBar from "@/components/nav-bar"

export default function ChatPage() {
  const [messages, setMessages] = useState<{ type: "question" | "response"; text: string }[]>([
    { type: "response", text: "Some response" },
    { type: "question", text: "Question" },
    { type: "response", text: "Some response" },
    { type: "question", text: "Question" },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { type: "question", text: input }])
      // Simulate response
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "response", text: "Some response" }])
      }, 1000)
      setInput("")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Tell me something about</h1>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full bg-green-400 hover:bg-green-500 text-black">Constitution</Button>
            <Button className="rounded-full bg-gray-200 hover:bg-gray-300 text-black">Proverbs and meanings</Button>
            <Button className="rounded-full bg-indigo-400 hover:bg-indigo-500 text-white">Trending stories</Button>
            <Button className="rounded-full bg-red-400 hover:bg-red-500 text-white">Bye-laws</Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mb-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === "question" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl px-6 py-3 max-w-[80%] ${
                  message.type === "question" ? "bg-sky-300 text-black" : "bg-gray-200 text-black"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Ghana"
            className="w-full py-4 px-6 rounded-full bg-gray-200 pr-12"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          <Button
            onClick={handleSend}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
