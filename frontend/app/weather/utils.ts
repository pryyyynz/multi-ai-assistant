import { Cloud, CloudRain, CloudFog, CloudLightning, CloudSnow, Sun, CloudSun, type LucideIcon } from "lucide-react"

// Map weather condition codes to Lucide icons
export function getWeatherIcon(conditionText: string): LucideIcon {
  const text = conditionText.toLowerCase()

  if (text.includes("thunder") || text.includes("lightning")) {
    return CloudLightning
  } else if (text.includes("rain") || text.includes("drizzle") || text.includes("shower")) {
    return CloudRain
  } else if (text.includes("snow") || text.includes("sleet") || text.includes("ice")) {
    return CloudSnow
  } else if (text.includes("fog") || text.includes("mist")) {
    return CloudFog
  } else if (text.includes("overcast") || text.includes("cloudy")) {
    return Cloud
  } else if (text.includes("partly cloudy") || text.includes("partly sunny")) {
    return CloudSun
  } else if (text.includes("sunny") || text.includes("clear")) {
    return Sun
  } else {
    // Default icon
    return Cloud
  }
}

// Format date to day of week
export function formatDayOfWeek(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

// Format time (e.g., "2023-05-01 13:00" to "13:00")
export function formatTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}
