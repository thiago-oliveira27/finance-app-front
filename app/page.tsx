"use client"

import { useState } from "react"
import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { StatCard } from "@/components/stat-card"
import { TransactionModal } from "@/components/transaction-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react"

export default function Dashboard() {
  const { data, loading, addTransaction, getMonthlyStats } = useFinancial()
  const [modalOpen, setModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">💫</div>
            <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = getMonthlyStats()
  const savings = stats.income - stats.expenses

  const categoryData =
    data?.transactions
      .filter((t) => new Date(t.date).toISOString().slice(0, 7) === new Date().toISOString().slice(0, 7))
      .reduce(
        (acc, t) => {
          const cat = acc.find((c) => c.category === t.category)
          if (cat) cat.amount += t.amount
          else acc.push({ category: t.category, amount: t.amount })
          return acc
        },
        [] as Array<{ category: string; amount: number }>,
      ) || []

  const monthlyData = [
    { month: "Jan", income: 4800, expenses: 2400 },
    { month: "Fev", income: 5200, expenses: 2800 },
    { month: "Mar", income: 4900, expenses: 2900 },
    { month: "Abr", income: 5000, expenses: stats.expenses },
    { month: "Mai", income: 5100, expenses: 2600 },
  ]

  return (
    <AuthGuard>
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Painel</h2>
              <p className="text-muted-foreground mt-1">Bem-vindo de volta, aqui esta seu resumo financeiro</p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Transacao
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Receita Mensal"
              value={`R$ ${stats.income.toFixed(2)}`}
              icon={<TrendingUp />}
              color="green"
              trend={8}
            />
            <StatCard
              label="Despesas Mensais"
              value={`R$ ${stats.expenses.toFixed(2)}`}
              icon={<TrendingDown />}
              color="red"
              trend={-5}
            />
            <StatCard
              label="Economia do Mes"
              value={`R$ ${savings.toFixed(2)}`}
              icon={<Wallet />}
              color="blue"
              trend={15}
            />
            <StatCard label="Economia Total" value={`R$ ${(savings * 12).toFixed(2)}`} color="purple" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="income" fill="#52B788" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#C7CEEA", "#FF85B3"].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transacoes Recentes</h3>
            <div className="space-y-3">
              {data?.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {CATEGORIES.find((c) => c.id === transaction.category)?.icon || "📝"}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSave={addTransaction} />
    </div>
    </AuthGuard>
  )
}

import { CATEGORIES } from "@/lib/constants"
