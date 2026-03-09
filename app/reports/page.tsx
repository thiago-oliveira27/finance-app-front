"use client"

import { useState, useEffect, useMemo } from "react"
import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Download, FileBarChart, ShieldAlert } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { cn, formatCurrency } from "@/lib/utils"

/**
 * Página de Relatórios Analíticos.
 * Consolida dados históricos de transações em visualizações temporais.
 */
export default function ReportsPage() {
  const { data, loading } = useFinancial()
  const [mounted, setMounted] = useState(false)

  // Previne erros de hidratação entre servidor e cliente (específico para Recharts)
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Agregador de dados mensais.
   * Transforma a lista plana de transações em um array estruturado para os gráficos.
   */
  const monthlyData = useMemo(() => {
    if (!data?.transactions?.length) return []

    const monthsMap: Record<string, { month: string; monthIndex: number; income: number; expenses: number; savings: number }> = {}
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    data.transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthIndex = date.getMonth()
      const monthLabel = monthNames[monthIndex]
      
      if (!monthsMap[monthLabel]) {
        monthsMap[monthLabel] = { month: monthLabel, monthIndex, income: 0, expenses: 0, savings: 0 }
      }

      const amount = Number(t.amount)
      if (t.type === "income") {
        monthsMap[monthLabel].income += amount
      } else {
        monthsMap[monthLabel].expenses += amount
      }
      
      monthsMap[monthLabel].savings = monthsMap[monthLabel].income - monthsMap[monthLabel].expenses
    })

    // Ordenação cronológica baseada no índice do mês
    return Object.values(monthsMap).sort((a, b) => a.monthIndex - b.monthIndex)
  }, [data?.transactions])

  /**
   * Gera e dispara o download de um arquivo CSV com o histórico completo.
   */
  const handleExportCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Valor", "Descricao"]
    const rows = data?.transactions.map((t) => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.type === "income" ? "Receita" : "Despesa",
      t.category,
      t.amount,
      t.description,
    ]) || []

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio_finplan_${new Date().getFullYear()}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-primary text-3xl">🔄</div>
          <p className="font-medium animate-pulse">Processando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1400px] mx-auto">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
                <p className="text-muted-foreground mt-1">Análise de desempenho e tendências históricas.</p>
              </div>
              <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Gráfico de Tendências com suporte a Privacidade */}
              <Card className="p-6 relative overflow-hidden group border-border/50">
                <div className="flex items-center gap-2 mb-6 text-foreground">
                  <FileBarChart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold tracking-tight">Tendências de Fluxo</h3>
                </div>
                
                <div className={cn(
                  "h-[400px] w-full transition-all duration-700",
                  data.settings.hideValues && "blur-xl opacity-30 grayscale pointer-events-none"
                )}>
                  {mounted && (monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} hide={data.settings.hideValues} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          formatter={(value: number) => [formatCurrency(value), "Valor"]}
                        />
                        <Legend iconType="circle" />
                        <Line type="monotone" dataKey="income" name="Receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
                        <Line type="monotone" dataKey="expenses" name="Despesa" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} />
                        <Line type="monotone" dataKey="savings" name="Economia" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-border/40">
                      Volume de dados insuficiente para projeção de tendências.
                    </div>
                  ))}
                </div>

                {data.settings.hideValues && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="flex flex-col items-center gap-2 bg-card p-6 rounded-2xl border border-border shadow-2xl">
                      <ShieldAlert className="w-8 h-8 text-muted-foreground animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Privacidade Ativa</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Gráfico de Comparação com suporte a Privacidade */}
              <Card className="p-6 relative overflow-hidden border-border/50">
                <h3 className="text-lg font-semibold mb-6">Comparativo Mensal</h3>
                <div className={cn(
                  "h-[300px] w-full transition-all duration-700",
                  data.settings.hideValues && "blur-xl opacity-30 grayscale pointer-events-none"
                )}>
                  {mounted && (monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} hide={data.settings.hideValues} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          formatter={(value: number) => [formatCurrency(value), "Valor"]}
                        />
                        <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="expenses" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="savings" name="Economia" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-border/40">
                      Nenhuma transação registrada para o período selecionado.
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}