"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Wallet, FileText, Settings, LogOut, Sun, Moon, Target, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getUser } from "@/lib/auth"
import { useFinancial } from "@/hooks/useFinancial"
import { Switch } from "@/components/ui/switch"

/**
 * Definição das rotas principais da aplicação.
 */
const NAV_ITEMS = [
  { href: "/", icon: BarChart3, label: "Painel" },
  { href: "/transactions", icon: Wallet, label: "Transações" },
  { href: "/reports", icon: FileText, label: "Relatórios" },
  { href: "/goals", icon: Target, label: "Metas" },   
]

/**
 * Componente de Navegação Lateral (Sidebar).
 * Gerencia a renderização de links, persistência de preferências visuais e autenticação de sessão.
 */
export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()
  const { data, updateSettings } = useFinancial()
  
  // Controle de estado para garantir a sincronização entre servidor e cliente (Hydration Control)
  const [mounted, setMounted] = useState(false)

  /**
   * Ciclo de vida para validação de montagem no lado do cliente.
   * Previne erros de disparidade no HTML renderizado via SSR.
   */
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Finaliza a sessão do usuário e redireciona para o fluxo de autenticação.
   */
  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <nav className="border-r border-border bg-card">
      <div className="flex flex-col h-screen w-64">
        
        {/* Identidade Visual e Perfil do Usuário */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">FinPlan</h1>
          {/* Renderização condicional para evitar erros de hidratação com dados do localStorage */}
          {mounted && user && (
            <p className="text-sm text-muted-foreground mt-1 truncate">{user.nome}</p>
          )}
        </div>
        
        {/* Menu Principal de Navegação */}
        <div className="flex-1 overflow-auto">
          <ul className="space-y-2 p-4">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    pathname === href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Controles de Configuração de Interface e Sessão */}
        <div className="p-4 space-y-4">
          
          {/* Seletor de Tema (Persistência via Contexto Financeiro) */}
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">
              Tema
            </span>
            
            <div className="flex items-center gap-2">
              <Sun className={cn(
                "w-4 h-4 transition-colors",
                data.settings.theme === "light" ? "text-yellow-500" : "text-muted-foreground"
              )} />
              
              <Switch
                checked={data.settings.theme === "dark"}
                onCheckedChange={(checked) =>
                  updateSettings({ theme: checked ? "dark" : "light" })
                }
              />
              
              <Moon className={cn(
                "w-4 h-4 transition-colors",
                data.settings.theme === "dark" ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {/* Gatilho de encerramento de sessão segura */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-destructive/10 hover:text-destructive w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Sair do sistema</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}