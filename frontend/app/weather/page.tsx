"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { Cloud, ChevronDown, Zap } from "lucide-react"

export default function WeatherPage() {
  const [selectedCity, setSelectedCity] = useState("Accra")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-3xl mx-auto mt-8">
        <Card className="p-8">
          <h2 className="text-4xl font-bold mb-8">Weather</h2>

          <div className="mb-6">
            <Button variant="outline" className="w-full justify-between text-xl py-6">
              <div className="flex items-center">
                <Cloud className="mr-2 h-6 w-6" />
                {selectedCity}
              </div>
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center justify-center mb-12">
            <Cloud className="h-32 w-32 text-blue-400 mr-6" />
            <div>
              <div className="text-7xl font-bold">29°</div>
              <div className="text-3xl">Mostly cloudy</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-12">
            {["13:00", "14:00", "15:00", "16:00"].map((time, index) => (
              <div key={time} className="text-center">
                <div className="text-xl font-medium">{time}</div>
                <div className="flex justify-center my-3">
                  {index === 0 ? (
                    <div className="relative">
                      <Cloud className="h-14 w-14 text-blue-400" />
                      <Zap className="h-6 w-6 text-yellow-400 absolute bottom-0 right-0" />
                    </div>
                  ) : (
                    <Cloud className="h-14 w-14 text-blue-400" />
                  )}
                </div>
                <div className="text-xl font-bold">{index === 0 ? "31°C" : index === 3 ? "39°C" : "30°C"}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            {["Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xl font-medium">{day}</div>
                <div className="flex justify-center my-3">
                  {index % 2 === 0 ? (
                    <div className="relative">
                      <Cloud className="h-14 w-14 text-blue-400" />
                      <Zap className="h-6 w-6 text-yellow-400 absolute bottom-0 right-0" />
                    </div>
                  ) : (
                    <Cloud className="h-14 w-14 text-blue-400" />
                  )}
                </div>
                <div className="text-xl font-bold">{index % 2 === 0 ? "31°C" : "30°C"}</div>
                <div className="text-md">{`${24 - index}°C`}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
