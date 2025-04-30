"use client"

import React from "react"
import { CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, CloudSun, CloudIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentWeather } from "@/app/weather/actions"

// Available cities in Ghana
const CITIES = ["Accra", "Kumasi", "Takoradi", "Cape Coast", "Tamale", "Ho", "Koforidua"]

// Function to get appropriate weather icon
function getWeatherIcon(condition: string) {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
    return <Sun className="h-12 w-12" />
  } else if (conditionLower.includes("partly cloudy")) {
    return <CloudSun className="h-12 w-12" />
  } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    return <CloudRain className="h-12 w-12" />
  } else if (conditionLower.includes("thunder") || conditionLower.includes("lightning")) {
    return <CloudLightning className="h-12 w-12" />
  } else if (conditionLower.includes("snow") || conditionLower.includes("sleet")) {
    return <CloudSnow className="h-12 w-12" />
  } else if (conditionLower.includes("mist") || conditionLower.includes("fog")) {
    return <CloudFog className="h-12 w-12" />
  } else {
    return <CloudIcon className="h-12 w-12" />
  }
}

export function WeatherWidget() {
  const [city, setCity] = React.useState("Accra")
  const [weather, setWeather] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchWeather() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCurrentWeather(city)
        if (data) {
          setWeather(data)
        } else {
          setError("Could not load weather data")
        }
      } catch (err) {
        setError("Error fetching weather data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [city])

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-full mr-4" />
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : weather ? (
        <div className="flex items-center">
          <div className="mr-4">{getWeatherIcon(weather.current.condition.text)}</div>
          <div>
            <div className="text-4xl font-bold">{weather.current.temp_c}°C</div>
            <div className="text-gray-600">{weather.current.condition.text}</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No weather data available</div>
      )}
    </div>
  )
}
