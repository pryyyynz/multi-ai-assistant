"use server"

// Types for the weather API response
export interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    localtime: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_kph: number
    wind_dir: string
    humidity: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    uv: number
  }
}

export interface ForecastData {
  location: {
    name: string
    region: string
    country: string
  }
  forecast: {
    forecastday: Array<{
      date: string
      day: {
        maxtemp_c: number
        maxtemp_f: number
        mintemp_c: number
        mintemp_f: number
        condition: {
          text: string
          icon: string
          code: number
        }
        daily_chance_of_rain: number
        avghumidity: number
        maxwind_kph: number
        uv: number
      }
      hour: Array<{
        time: string
        temp_c: number
        temp_f: number
        condition: {
          text: string
          icon: string
          code: number
        }
      }>
    }>
  }
}

// Function to get current weather
export async function getCurrentWeather(city: string): Promise<WeatherData | null> {
  try {
    // Use environment variable for API key
    const API_KEY = process.env.WEATHER_API

    // Add "Ghana" to the city name to make it more specific
    const location = `${city}, Ghana`

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}`,
      {
        cache: "no-store", // Don't cache the response
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error fetching weather for ${city}: ${response.status} ${response.statusText}`)
      console.error(`API response: ${errorText}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch weather data for ${city}:`, error)
    return null
  }
}

// Function to get forecast
export async function getForecast(city: string): Promise<ForecastData | null> {
  try {
    // Use environment variable for API key
    const API_KEY = process.env.WEATHER_API

    // Add "Ghana" to the city name to make it more specific
    const location = `${city}, Ghana`

    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=5`,
      {
        cache: "no-store", // Don't cache the response
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error fetching forecast for ${city}: ${response.status} ${response.statusText}`)
      console.error(`API response: ${errorText}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch forecast data for ${city}:`, error)
    return null
  }
}
