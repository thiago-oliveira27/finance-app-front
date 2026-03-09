"use client"

import { useState, useMemo } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

/**
 * Gerenciamento centralizado de movimentações financeiras.
 * Interface para visualização, filtragem e exclusão de registros transacionais.
 */
export default function TransactionsPage() {
  const { data, deleteTransaction, addTransaction } = useFinancial()
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  /**
   * Pipeline de filtragem de dados.
   * Aplica critérios de busca textual, tipificação e categorização de forma reativa.
   */
  const filtered = useMemo(() => {
    return data?.transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || t.type === filterType
      const matchesCategory = filterCategory === "all" || String(t.category) === String(filterCategory)
      
      return matchesSearch && matchesType && matchesCategory
    }) || []
  }, [data?.transactions, searchQuery, filterType, filterCategory])

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Transações</h2>
                <p className="text-muted-foreground mt-1">Gerencie e acompanhe todas as suas movimentações</p>
              </div>
              <button 
                onClick={() => setModalOpen(true)} 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </button>
            </div>

            {/* Seção de filtros e busca customizada */}
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
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

            {/* Listagem de registros sincronizados com o backend */}
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    Nenhuma transação encontrada com os filtros aplicados.
                  </div>
                ) : (
                  filtered.map((transaction) => {
                    const categoryInfo = CATEGORIES.find((c) => String(c.id) === String(transaction.category));

                    return (
                      <div
                        key={transaction.id}
                        className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {categoryInfo?.icon || "💰"}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryInfo ? categoryInfo.name : "Geral"} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {/* Exibição de valores monetários com sinalização de fluxo */}
                          <p className={`font-bold text-lg ${transaction.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                            {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                          </p>
                          
                          {/* Fluxo de confirmação para destruição de registro */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta transação? Esta operação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteTransaction(transaction.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90 px-6 py-2.5 font-bold"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })
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