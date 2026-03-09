"use client"

import { useState } from "react"
import type { Transaction } from "@/types"
import { CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Omit<Transaction, "id">) => void
}

export function TransactionModal({ open, onOpenChange, onSave }: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  const handleSave = () => {
    if (amount && category && description) {
      onSave({
        type,
        amount: Number.parseFloat(amount),
        category,
        description,
        date: new Date(),
      })
      // Limpa os campos após salvar
      setAmount("")
      setCategory("")
      setDescription("")
      onOpenChange(false)
    }
  }

  // CORREÇÃO: Agora filtramos usando os IDs numéricos que estão no seu constants.ts
  // ID 7 = Salário, ID 8 = Freelance
  const filteredCategories = CATEGORIES.filter((c) => {
    const isIncomeCategory = ["6", "7"].includes(c.id)
    
    if (type === "income") return isIncomeCategory
    return !isIncomeCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income")
                setCategory("") // Limpa a categoria ao trocar o tipo
              }}
              className="flex-1"
            >
              Receita
            </Button>
            <Button
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense")
                setCategory("") // Limpa a categoria ao trocar o tipo
              }}
              className="flex-1"
            >
              Despesa
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="mr-2">{cat.icon}</span> {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              placeholder="Para que foi essa transação?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={!amount || !category || !description} // Desabilita se faltar dados
          >
            Salvar Transação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}