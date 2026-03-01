export type TransactionType = "income" | "expense"

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: Date
}

export interface FinancialData {
  transactions: Transaction[]
  settings: {
    currency: string
    theme: "light" | "dark"
  }
}
