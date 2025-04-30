"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import NavBar from "@/components/nav-bar"
import { Cloud, Zap, Sun, CloudRain, CloudFog, CloudLightning, CloudSnow, AlertTriangle } from "lucide-react"
import { getCurrentWeather, getForecast, type WeatherData, type ForecastData } from "./actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define cities directly in the client component
const CITIES = ["Accra", "Kumasi", "Takoradi", "Cape Coast", "Tamale", "Ho", "Koforidua"]

// Helper function to get the appropriate weather icon
function getWeatherIcon(condition: string) {
  const lowerCondition = condition?.toLowerCase() || ""

  if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
    return Sun
  } else if (lowerCondition.includes("rain") && lowerCondition.includes("thunder")) {
    return CloudLightning
  } else if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    return CloudRain
  } else if (lowerCondition.includes("fog") || lowerCondition.includes("mist")) {
    return CloudFog
  } else if (lowerCondition.includes("snow") || lowerCondition.includes("sleet")) {
    return CloudSnow
  } else {
    return Cloud
  }
}

// Helper function to format day of week
function formatDayOfWeek(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

// Helper function to format time
function formatTime(timeString: string) {
  const date = new Date(timeString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

export default function WeatherPage() {
  const [selectedCity, setSelectedCity] = useState("Accra")
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeatherData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch current weather first
        const weatherData = await getCurrentWeather(selectedCity)
        setCurrentWeather(weatherData)

        if (!weatherData) {
          setError(`Unable to fetch current weather for ${selectedCity}`)
          setLoading(false)
          return
        }

        // Then fetch forecast
        const forecastData = await getForecast(selectedCity)
        setForecast(forecastData)

        if (!forecastData) {
          setError(`Unable to fetch forecast for ${selectedCity}`)
        }
      } catch (error) {
        console.error("Error fetching weather data:", error)
        setError(`Failed to load weather data: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [selectedCity])

  // Get the appropriate weather icon component
  const WeatherIcon = currentWeather ? getWeatherIcon(currentWeather.current.condition.text) : Cloud

  // Get hourly forecast for today (next 4 hours)
  const hourlyForecast = forecast?.forecast?.forecastday?.[0]?.hour || []
  const currentHour = new Date().getHours()
  const nextFourHours = hourlyForecast
    .filter((hour) => {
      const hourTime = new Date(hour.time).getHours()
      return hourTime > currentHour && hourTime <= currentHour + 4
    })
    .slice(0, 4)

  // Get daily forecast (next 4 days)
  const dailyForecast = forecast?.forecast?.forecastday?.slice(1, 5) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NavBar />

      <div className="max-w-3xl mx-auto mt-8">
        <Card className="p-8">
          <h2 className="text-4xl font-bold mb-8">Weather</h2>

          <div className="mb-6">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full text-xl py-6">
                <SelectValue placeholder="Select a city" />
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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-12">
                <Skeleton className="h-32 w-32 rounded-full mr-6" />
                <div>
                  <Skeleton className="h-16 w-32 mb-2" />
                  <Skeleton className="h-8 w-48" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentWeather && (
                <div className="flex items-center justify-center mb-12">
                  <div className="mr-6">
                    <WeatherIcon className="h-32 w-32 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-7xl font-bold">{Math.round(currentWeather.current.temp_c)}°</div>
                    <div className="text-3xl">{currentWeather.current.condition.text}</div>
                    <div className="text-xl mt-2">
                      Humidity: {currentWeather.current.humidity}% | Wind: {currentWeather.current.wind_kph} km/h
                    </div>
                  </div>
                </div>
              )}

              {/* Hourly forecast */}
              <h3 className="text-2xl font-semibold mb-4">Hourly Forecast</h3>
              <div className="grid grid-cols-4 gap-6 mb-12">
                {nextFourHours.length > 0
                  ? nextFourHours.map((hour) => {
                      const HourIcon = getWeatherIcon(hour.condition.text)
                      return (
                        <div key={hour.time} className="text-center">
                          <div className="text-xl font-medium">{formatTime(hour.time)}</div>
                          <div className="flex justify-center my-3">
                            <HourIcon className="h-14 w-14 text-blue-400" />
                          </div>
                          <div className="text-xl font-bold">{Math.round(hour.temp_c)}°C</div>
                        </div>
                      )
                    })
                  : // Fallback if no hourly data is available
                    Array(4)
                      .fill(0)
                      .map((_, index) => {
                        const hour = new Date()
                        hour.setHours(hour.getHours() + index + 1)
                        return (
                          <div key={index} className="text-center">
                            <div className="text-xl font-medium">
                              {hour.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </div>
                            <div className="flex justify-center my-3">
                              <Cloud className="h-14 w-14 text-blue-400" />
                            </div>
                            <div className="text-xl font-bold">--°C</div>
                          </div>
                        )
                      })}
              </div>

              {/* Daily forecast */}
              <h3 className="text-2xl font-semibold mb-4">Daily Forecast</h3>
              <div className="grid grid-cols-4 gap-4">
                {dailyForecast.length > 0
                  ? dailyForecast.map((day) => {
                      const DayIcon = getWeatherIcon(day.day.condition.text)
                      return (
                        <div key={day.date} className="text-center">
                          <div className="text-xl font-medium">{formatDayOfWeek(day.date)}</div>
                          <div className="flex justify-center my-3 relative">
                            <DayIcon className="h-14 w-14 text-blue-400" />
                            {day.day.daily_chance_of_rain > 30 && (
                              <Zap className="h-6 w-6 text-yellow-400 absolute bottom-0 right-0" />
                            )}
                          </div>
                          <div className="text-xl font-bold">{Math.round(day.day.maxtemp_c)}°C</div>
                          <div className="text-md">{Math.round(day.day.mintemp_c)}°C</div>
                        </div>
                      )
                    })
                  : // Fallback if no daily data is available
                    Array(4)
                      .fill(0)
                      .map((_, index) => {
                        const day = new Date()
                        day.setDate(day.getDate() + index + 1)
                        return (
                          <div key={index} className="text-center">
                            <div className="text-xl font-medium">
                              {day.toLocaleDateString("en-US", { weekday: "short" })}
                            </div>
                            <div className="flex justify-center my-3">
                              <Cloud className="h-14 w-14 text-blue-400" />
                            </div>
                            <div className="text-xl font-bold">--°C</div>
                            <div className="text-md">--°C</div>
                          </div>
                        )
                      })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
