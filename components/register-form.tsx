"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, Wallet } from "lucide-react"

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === parseInt(digits[10])
}

interface FieldErrors {
  nome?: string
  email?: string
  cpf?: string
  telefone?: string
  senha?: string
  confirmarSenha?: string
}

export function RegisterForm() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate(): FieldErrors {
    const errs: FieldErrors = {}

    if (nome.trim().length < 3) {
      errs.nome = "Nome deve ter pelo menos 3 caracteres"
    }
    if (!email.includes("@") || !email.includes(".")) {
      errs.email = "Digite um email valido"
    }
    if (cpf && !isValidCpf(cpf)) {
      errs.cpf = "CPF invalido"
    }
    if (telefone && telefone.replace(/\D/g, "").length < 10) {
      errs.telefone = "Telefone incompleto"
    }
    if (senha.length < 6) {
      errs.senha = "Senha deve ter pelo menos 6 caracteres"
    }
    if (senha !== confirmarSenha) {
      errs.confirmarSenha = "As senhas nao coincidem"
    }

    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError("")

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setLoading(true)
    try {
      await register({ nome: nome.trim(), email, senha })
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Conta criada com sucesso!</h3>
            <p className="mt-1 text-sm text-muted-foreground">Redirecionando para o login...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
        <CardDescription>Preencha os dados para criar sua conta no FinPlan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {apiError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                autoComplete="off"
              />
              {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="text"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                autoComplete="tel"
              />
              {errors.telefone && <p className="text-xs text-destructive">{errors.telefone}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reg-senha">Senha</Label>
            <Input
              id="reg-senha"
              type="password"
              placeholder="Minimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
            />
            {errors.senha && <p className="text-xs text-destructive">{errors.senha}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmar-senha">Confirmar senha</Label>
            <Input
              id="confirmar-senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              autoComplete="new-password"
            />
            {errors.confirmarSenha && <p className="text-xs text-destructive">{errors.confirmarSenha}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {"Ja tem uma conta? "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
