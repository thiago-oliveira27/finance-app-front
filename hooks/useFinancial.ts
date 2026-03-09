"use client"

import { useState, useEffect } from "react"
import type { FinancialData, Transaction } from "@/types"
import { getToken } from "@/lib/auth"

/**
 * Hook customizado para orquestração do estado financeiro e sincronização com serviços externos.
 * Gerencia o ciclo de vida dos dados transacionais, metas e preferências de interface.
 */
export function useFinancial() {
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    goals: [],    
    budgets: [],  
    settings: { 
      currency: "BRL", 
      theme: "light",
      hideValues: false 
    }
  })
  const [loading, setLoading] = useState(true)

  /**
   * Efeito de inicialização: Recupera transações do backend e sincroniza metas persistidas localmente.
   */
  useEffect(() => {
    async function fetchFinancialData() {
      const token = getToken()
      
      // Recuperação de metas do armazenamento local (LocalStorage)
      const savedGoals = localStorage.getItem("finplan_goals")
      if (savedGoals) {
        setData(prev => ({ ...prev, goals: JSON.parse(savedGoals) }))
      }

      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch("/api/transaction", {
          headers: { "Authorization": `Bearer ${token}` }
        })

        if (!response.ok) throw new Error("Falha na comunicação com a API de transações")

        const res = await response.json()
        
        const mappedTransactions: Transaction[] = Array.isArray(res) 
          ? res.map((t: any) => {
              const rawDate = t.dataHoraTransacao || t.dataTransacao;
              return {
                id: (t.idTransacao || t.id || Math.random()).toString(),
                type: t.tipo === "R" ? "income" : "expense",
                amount: Number(t.valor) || 0,
                description: t.descricao || "",
                category: t.idCategoria ? t.idCategoria.toString() : "",
                date: rawDate ? new Date(rawDate.split('T')[0] + "T12:00:00") : new Date()
              }
            })
          : []

        setData(prev => ({
          ...prev,
          transactions: mappedTransactions
        }))
      } catch (error) {
        console.error("Erro ao processar integração de dados transacionais:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFinancialData()
  }, [])

  /**
   * Registra uma nova movimentação financeira no serviço de persistência.
   */
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const token = getToken()
      const payload = {
        tipo: transaction.type === "income" ? "R" : "D",
        valor: transaction.amount,
        descricao: transaction.description,
        dataTransacao: new Date(transaction.date).toISOString().split('T')[0],
        idCategoria: Number(transaction.category) 
      }

      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error("Erro ao persistir transação")
      const newT = await response.json()

      const rawDate = newT.dataHoraTransacao || newT.dataTransacao;

      const mappedNew: Transaction = {
        id: (newT.idTransacao || newT.id || Date.now()).toString(),
        type: newT.tipo === "R" ? "income" : "expense",
        amount: Number(newT.valor) || 0,
        description: newT.descricao || "",
        category: newT.idCategoria ? newT.idCategoria.toString() : transaction.category,
        date: rawDate ? new Date(rawDate.split('T')[0] + "T12:00:00") : new Date()
      }

      setData((prev) => ({
        ...prev,
        transactions: [mappedNew, ...prev.transactions]
      }))
    } catch (error) {
      console.error("Falha no fluxo de inserção de dados:", error);
    }
  }

  /**
   * Solicita a exclusão de um registro transacional específico via identificador único.
   */
  const deleteTransaction = async (id: string) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/transaction/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        setData((prev) => ({
          ...prev,
          transactions: prev.transactions.filter((t) => t.id !== id)
        }))
      }
    } catch (error) {
      console.error("Erro ao remover registro do banco de dados:", error)
    }
  }

  /**
   * Atualiza as configurações globais de visualização e persiste o estado do tema.
   */
  const updateSettings = (newSettings: Partial<FinancialData["settings"]>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }))
    
    if (newSettings.theme) {
      document.documentElement.classList.toggle("dark", newSettings.theme === "dark")
    }
  }

  /**
   * Gestão de Metas Financeiras (Persistência em armazenamento local do cliente).
   */
  const addGoal = (goal: any) => {
    setData(prev => {
      const updatedGoals = [...prev.goals, { ...goal, id: Date.now().toString() }];
      localStorage.setItem("finplan_goals", JSON.stringify(updatedGoals));
      return { ...prev, goals: updatedGoals };
    })
  }

  /**
   * Atualiza o estado de progresso de um objetivo específico e sincroniza localmente.
   */
  const updateGoal = (id: string, updates: any) => {
    setData(prev => {
      const updatedGoals = prev.goals.map((g: { id: string }) => g.id === id ? { ...g, ...updates } : g);
      localStorage.setItem("finplan_goals", JSON.stringify(updatedGoals));
      return { ...prev, goals: updatedGoals };
    })
  }

  /**
   * Consolida métricas de fluxo de caixa para consumo do Dashboard.
   */
  const getMonthlyStats = () => {
    const validTransactions = data.transactions.filter(t => !isNaN(t.date.getTime()));
    const income = validTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = validTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses }
  }

  return { 
    data, 
    loading, 
    addTransaction, 
    deleteTransaction, 
    updateSettings,
    addGoal,    
    updateGoal, 
    getMonthlyStats 
  }
}