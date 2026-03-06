"use client"

import { useState, useMemo, useEffect } from "react"
import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { StatCard } from "@/components/stat-card"
import { TransactionModal } from "@/components/transaction-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Plus, TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import { formatCurrency, cn } from "@/lib/utils"

/**
 * @component Dashboard
 * @description Ponto de entrada principal para visualização de métricas financeiras.
 * Orquestra o estado global proveniente do hook useFinancial e renderiza componentes
 * analíticos com suporte a estados de privacidade e hidratação segura.
 */
export default function Dashboard() {
  const { data, loading, addTransaction, getMonthlyStats, updateSettings } = useFinancial()
  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  /**
   * Hook de efeito para garantir que componentes dependentes de APIs do navegador (Recharts)
   * sejam renderizados apenas após a montagem do cliente, evitando inconsistências de SSR.
   */
  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = getMonthlyStats()
  const savings = stats.income - stats.expenses

  /**
   * Formatação de data localizada para o contexto do usuário.
   */
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  /**
   * Utilitário de formatação condicional para suporte ao modo de privacidade.
   * @param {number} value - O valor monetário a ser processado.
   */
  const formatValue = (value: number) => {
    if (data.settings.hideValues) return "R$ ••••••"
    return formatCurrency(value, data.settings.currency)
  }

  /**
   * Memoização da distribuição por categoria para otimizar performance de re-renderização.
   * Transforma a coleção de transações em um dataset estruturado para o PieChart.
   */
  const categoryData = useMemo(() => {
    if (!data?.transactions?.length) return []
    const groups = data.transactions.reduce((acc, t) => {
      const categoryObj = CATEGORIES.find((c) => c.id === t.category)
      const name = categoryObj ? categoryObj.name : "Geral"
      acc[name] = (acc[name] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)
    return Object.entries(groups).map(([name, value]) => ({ name, value }))
  }, [data?.transactions])

  /**
   * Dataset normalizado para o gráfico de fluxo de caixa mensal.
   */
  const chartData = useMemo(() => [
    { 
      name: "Resumo", 
      receita: Number(stats.income) || 0, 
      despesa: Number(stats.expenses) || 0 
    }
  ], [stats])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-primary">💫</div>
          <p className="font-medium">Sincronizando infraestrutura...</p>
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
            
            {/* Seção de Cabeçalho: Identidade e Ações Rápidas */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Painel</h2>
                <div className="mt-1 flex items-center gap-4">
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Bem-vindo ao seu controle financeiro.
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentDate}
                    </p>
                  </div>
                  
                  {/* Alternador de Privacidade: Controla a visibilidade de dados sensíveis em toda a UI */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-muted/20 hover:bg-muted transition-colors"
                    onClick={() => updateSettings({ hideValues: !data.settings.hideValues })}
                    title={data.settings.hideValues ? "Mostrar valores" : "Ocultar valores"}
                  >
                    {data.settings.hideValues ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-primary" />
                    )}
                  </Button>
                </div>
              </div>
              <Button onClick={() => setModalOpen(true)} className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Nova Transação
              </Button>
            </div>

            {/* Grid de KPIs: Indicadores chave de performance financeira */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Receita" value={formatValue(stats.income)} icon={<TrendingUp />} color="green" />
              <StatCard label="Despesas" value={formatValue(stats.expenses)} icon={<TrendingDown />} color="red" />
              <StatCard label="Economia" value={formatValue(savings)} icon={<Wallet />} color="blue" />
              <StatCard label="Saldo Total" value={formatValue(savings)} icon={<TrendingUp />} color="purple" />
            </div>

            {/* Seção Analítica: Gráficos comparativos e distribuição de gastos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 h-[400px] relative overflow-hidden group">
                <h3 className="text-lg font-semibold mb-6">Receitas vs Despesas</h3>
                <div className={cn(
                  "w-full h-full pb-10 transition-all duration-500",
                  data.settings.hideValues && "blur-md opacity-40 grayscale pointer-events-none"
                )}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                        <YAxis stroke="var(--muted-foreground)" hide={data.settings.hideValues} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          formatter={(value: number) => [formatValue(value), "Valor"]}
                        />
                        <Legend />
                        <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
                        <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {data.settings.hideValues && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-[2px]">
                    <div className="bg-card/90 px-4 py-2 rounded-full border border-border shadow-lg flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Modo Privado</span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 h-[400px] relative overflow-hidden group">
                <h3 className="text-lg font-semibold mb-6">Divisão por Categoria</h3>
                <div className={cn(
                  "w-full h-full pb-10 transition-all duration-500",
                  data.settings.hideValues && "blur-md opacity-40 grayscale pointer-events-none"
                )}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData.length > 0 ? categoryData : [{ name: "Sem dados", value: 0.01 }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          paddingAngle={5}
                        >
                          {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color, i) => (
                            <Cell key={`cell-${i}`} fill={color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          formatter={(value: number) => formatValue(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>

            {/* Listagem de Atividades Recentes: Histórico transacional imediato */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
              <div className="space-y-3">
                {!data.transactions?.length ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl border-border/50">
                    <p className="text-muted-foreground">Sincronizando com o serviço de persistência...</p>
                  </div>
                ) : (
                  data.transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-inner">
                          {CATEGORIES.find((c) => c.id === t.category)?.icon || "💰"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.description}</p>
                          <p className="text-sm text-muted-foreground">{t.date.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                        {t.type === "income" ? "+" : "-"} {formatValue(t.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
        <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSave={addTransaction} />
      </div>
    </AuthGuard>
  )
}