"use client"

import { useState } from "react"
import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { TransactionModal } from "@/components/transaction-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Search } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import { AuthGuard } from "@/components/auth-guard"

export default function TransactionsPage() {
  const { data, deleteTransaction, addTransaction } = useFinancial()
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const filtered =
    data?.transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || t.type === filterType
      const matchesCategory = filterCategory === "all" || t.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    }) || []

  return (
    <AuthGuard>
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Transacoes</h2>
              <p className="text-muted-foreground mt-1">Gerencie e acompanhe todas as suas transacoes</p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Transacao
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transacoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Transactions List */}
          <Card>
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Nenhuma transacao encontrada</div>
              ) : (
                filtered.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 flex items-center justify-between hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {CATEGORIES.find((c) => c.id === transaction.category)?.icon || "📝"}
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {CATEGORIES.find((c) => c.id === transaction.category)?.name || "Outro"} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => deleteTransaction(transaction.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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
