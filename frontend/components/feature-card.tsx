import type { ReactNode } from "react"

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border rounded-lg p-3 md:p-6 flex flex-col items-center text-center h-full hover:shadow-md transition-shadow">
      <div className="mb-2 md:mb-4">{icon}</div>
      <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-gray-500">{description}</p>
    </div>
  )
}
