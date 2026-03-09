import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: string // Alterado de number para string
  color?: "green" | "red" | "blue" | "purple"
}

export function StatCard({ label, value, icon, trend, color = "blue" }: StatCardProps) {
  const colorMap = {
    green: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  }

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.includes('+') ? "text-emerald-500" : "text-red-500"}>
              {trend}
            </span>
          </p>
        )}
      </div>
    </Card>
  )
}