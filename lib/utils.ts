import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico para o formato de moeda dinamicamente.
 * @param value O valor a ser formatado
 * @param currency O código da moeda (ex: "BRL", "USD", "EUR")
 */
export function formatCurrency(value: number, currency: string = "BRL") {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}