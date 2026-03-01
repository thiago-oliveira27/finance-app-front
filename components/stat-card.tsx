import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: number
  color?: "green" | "red" | "blue" | "purple"
}

export function StatCard({ label, value, icon, trend, color = "blue" }: StatCardProps) {
  const colorClasses = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% em relacao ao mes anterior
            </p>
          )}
        </div>
        {icon && <div className={`text-3xl ${colorClasses[color]}`}>{icon}</div>}
      </div>
    </Card>
  )
}
