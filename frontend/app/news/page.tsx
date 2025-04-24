"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import NavBar from "@/components/nav-bar"
import { Cloud, ChevronDown, Zap } from "lucide-react"
import Image from "next/image"

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState("Latest")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        {/* News Section */}
        <div>
          <h2 className="text-4xl font-bold mb-8">News</h2>

          <div className="flex space-x-6 mb-8">
            {["Latest", "Popular", "By Source"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                className={`rounded-full px-6 ${activeTab === tab ? "bg-blue-100 text-blue-800" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            <NewsItem
              image="/placeholder.svg?height=100&width=150"
              title="Ghana Launches New AI Research Initiative"
              source="GhanaWeb"
              time="2 h ago"
            />
            <NewsItem
              image="/placeholder.svg?height=100&width=150"
              title="How Tech Startups Are Driving Innovation in Ghana"
              source="MyJoyOnline"
              time="3 h ago"
            />
            <NewsItem
              image="/placeholder.svg?height=100&width=150"
              title="The Role of AI in Ghana's Education System"
              source="Citi Newsroom"
              time="5 h ago"
            />
            <NewsItem
              image="/placeholder.svg?height=100&width=150"
              title="Government to Support AI Development with New Policies"
              source="GhanaWeb"
              time="7 h ago"
            />
          </div>
        </div>

        {/* Weather Section */}
        <div>
          <h2 className="text-4xl font-bold mb-8">Weather</h2>

          <div className="mb-6">
            <Button variant="outline" className="w-full justify-between text-xl py-6">
              <div className="flex items-center">
                <Cloud className="mr-2 h-6 w-6" />
                Accra
              </div>
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center mb-8">
            <Cloud className="h-24 w-24 text-blue-400 mr-4" />
            <div>
              <div className="text-6xl font-bold">29°</div>
              <div className="text-2xl">Mostly cloudy</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {["13:00", "14:00", "15:00", "16:00"].map((time, index) => (
              <div key={time} className="text-center">
                <div className="text-lg font-medium">{time}</div>
                <div className="flex justify-center my-2">
                  {index === 0 ? (
                    <div className="relative">
                      <Cloud className="h-10 w-10 text-blue-400" />
                      <Zap className="h-4 w-4 text-yellow-400 absolute bottom-0 right-0" />
                    </div>
                  ) : (
                    <Cloud className="h-10 w-10 text-blue-400" />
                  )}
                </div>
                <div className="text-lg font-bold">{index === 0 ? "31°C" : index === 3 ? "39°C" : "30°C"}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {["Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-lg font-medium">{day}</div>
                <div className="flex justify-center my-2">
                  {index % 2 === 0 ? (
                    <div className="relative">
                      <Cloud className="h-10 w-10 text-blue-400" />
                      <Zap className="h-4 w-4 text-yellow-400 absolute bottom-0 right-0" />
                    </div>
                  ) : (
                    <Cloud className="h-10 w-10 text-blue-400" />
                  )}
                </div>
                <div className="text-lg font-bold">{index % 2 === 0 ? "31°C" : "30°C"}</div>
                <div className="text-sm">{`${24 - index}°C`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsItem({ image, title, source, time }: { image: string; title: string; source: string; time: string }) {
  return (
    <div className="flex">
      <div className="flex-shrink-0 mr-4">
        <Image src={image || "/placeholder.svg"} alt={title} width={150} height={100} className="rounded" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <div className="text-gray-600">
          {source} · {time}
        </div>
      </div>
    </div>
  )
}
