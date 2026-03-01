"use client"

import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function ReportsPage() {
  const { data } = useFinancial()

  const monthlyData = [
    { month: "Jan", income: 4800, expenses: 2400, savings: 2400 },
    { month: "Fev", income: 5200, expenses: 2800, savings: 2400 },
    { month: "Mar", income: 4900, expenses: 2900, savings: 2000 },
    { month: "Abr", income: 5000, expenses: 2600, savings: 2400 },
    { month: "Mai", income: 5100, expenses: 2200, savings: 2900 },
  ]

  const handleExportCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Valor", "Descricao"]
    const rows =
      data?.transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.amount,
        t.description,
      ]) || []

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transacoes.csv"
    a.click()
  }

  return (
    <AuthGuard>
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Relatorios</h2>
              <p className="text-muted-foreground mt-1">Analise seus dados financeiros</p>
            </div>
            <Button onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tendencias Mensais</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="income" stroke="#52B788" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="savings" stroke="#4ECDC4" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comparacao Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="income" fill="#52B788" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="savings" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
