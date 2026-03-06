"use client"

import { useState } from "react"
import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Target, TrendingUp } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

/**
 * Definição da estrutura de uma Meta Financeira.
 */
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | Date;
}

export default function GoalsPage() {
  // Tipagem explícita extraída do hook para evitar erros de 'any'
  const { data, updateGoal, addGoal } = useFinancial()
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", target: "", deadline: "" })

  /**
   * Processa a criação de um novo objetivo financeiro.
   */
  const handleAddGoal = () => {
    if (formData.name && formData.target) {
      addGoal({
        name: formData.name,
        targetAmount: Number.parseFloat(formData.target),
        currentAmount: 0,
        deadline: formData.deadline || new Date(Date.now() + 31536000000).toISOString(),
        category: "savings",
      })
      setFormData({ name: "", target: "", deadline: "" })
      setModalOpen(false)
    }
  }

  /**
   * Atualiza o progresso acumulado de uma meta específica.
   * @param id Identificador único da meta
   * @param amount Valor a ser incrementado
   */
  const handleUpdateProgress = (id: string, amount: number) => {
    const goal = data?.goals.find((g: Goal) => g.id === id) // Tipado 'g' como Goal para resolver ts(7006)
    if (goal) {
      updateGoal(id, { 
        currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) 
      })
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1400px] mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Metas de Economia</h2>
              <p className="text-muted-foreground mt-1">Acompanhe seus objetivos e marcos financeiros.</p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.goals.map((goal: Goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

              return (
                <Card key={goal.id} className="p-6 border-border/50 hover:bg-muted/5 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo encerrado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-muted-foreground">Alvo: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
                        {percentage.toFixed(0)}% concluído
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleUpdateProgress(goal.id, 50)}>
                        + R$ 50
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleUpdateProgress(goal.id, 100)}>
                        + R$ 100
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Criar Novo Objetivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase text-muted-foreground">Nome da Meta</label>
              <Input
                placeholder="Ex: Viagem de Férias"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase text-muted-foreground">Valor Alvo</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase text-muted-foreground">Data Limite</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <Button onClick={handleAddGoal} className="w-full font-bold h-11">
              Confirmar Meta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}