"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Wallet } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isFormValid = email.includes("@") && senha.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.includes("@")) {
      setError("Digite um email valido")
      return
    }
    if (senha.length < 1) {
      setError("Digite sua senha")
      return
    }

    setLoading(true)
    try {
      await login(email, senha)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">FinPlan</CardTitle>
        <CardDescription>Entre na sua conta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {"Nao tem uma conta? "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
