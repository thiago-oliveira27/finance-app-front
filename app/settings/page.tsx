"use client"

import { useFinancial } from "@/hooks/useFinancial"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CURRENCIES } from "@/lib/constants"
import { AuthGuard } from "@/components/auth-guard"

export default function SettingsPage() {
  const { data, updateSettings } = useFinancial()

  return (
    <AuthGuard>
    <div className="flex h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div>
            <h2 className="text-3xl font-bold">Configuracoes</h2>
            <p className="text-muted-foreground mt-1">Gerencie suas preferencias e padroes</p>
          </div>

          <div className="mt-8 max-w-2xl space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Moeda</h3>
              <Select value={data?.settings.currency} onValueChange={(currency) => updateSettings({ currency })}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">Escolha sua moeda preferida para todas as transacoes</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tema</h3>
              <div className="flex gap-4">
                <Button
                  variant={data?.settings.theme === "light" ? "default" : "outline"}
                  onClick={() => updateSettings({ theme: "light" })}
                >
                  Claro
                </Button>
                <Button
                  variant={data?.settings.theme === "dark" ? "default" : "outline"}
                  onClick={() => updateSettings({ theme: "dark" })}
                >
                  Escuro
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gerenciamento de Dados</h3>
              <Button variant="destructive">Limpar Todos os Dados</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Isso ira deletar permanentemente todas as suas transacoes e dados
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
