"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { FileText } from "lucide-react"

export default function ChatPdfPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* PDF Chat */}
        <Card className="p-8 bg-gray-100">
          <div className="flex items-center mb-6">
            <FileText className="h-12 w-12 mr-4" />
            <h2 className="text-3xl font-bold">Chat with PDF</h2>
          </div>

          <div className="flex justify-center mb-8">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 text-xl">Upload PDFs</Button>
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

          <Button
            className="w-full py-4 bg-gray-300 hover:bg-gray-400 text-black text-xl"
            onClick={() => setInput("Ask question")}
          >
            Ask question
          </Button>
        </Card>

        {/* Resume Analyzer */}
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
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 text-xl">Upload CV</Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-4">Suggested Jobs</h3>
            {[1, 2, 3].map((job) => (
              <div key={job} className="bg-gray-200 p-4 rounded">
                <h4 className="text-2xl font-bold">Software Developer</h4>
                <p className="text-xl">ABC Tech</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
