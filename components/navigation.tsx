"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { BarChart3, Wallet, FileText, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout, getUser } from "@/lib/auth"

const NAV_ITEMS = [
  { href: "/", icon: BarChart3, label: "Painel" },
  { href: "/transactions", icon: Wallet, label: "Transacoes" },
  { href: "/reports", icon: FileText, label: "Relatorios" },
  { href: "/settings", icon: Settings, label: "Configuracoes" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <nav className="border-r border-border bg-card">
      <div className="flex flex-col h-screen">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">FinPlan</h1>
          {user && (
            <p className="text-sm text-muted-foreground mt-1 truncate">{user.nome}</p>
          )}
        </div>
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
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-destructive/10 hover:text-destructive w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
