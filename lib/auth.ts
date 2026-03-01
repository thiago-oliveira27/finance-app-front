// Usa proxy do Next.js (rewrites em next.config.mjs) para evitar problemas de CORS.
// As chamadas vao para /api/... que o Next redireciona para o backend.
const API_URL = ""

export interface AuthResponse {
  token: string
  tipo: string
  userId: number
  nome: string
}

export interface RegisterPayload {
  nome: string
  email: string
  senha: string
}

export interface UserData {
  userId: number
  nome: string
  email: string
}

export async function login(
  email: string,
  senha: string
): Promise<AuthResponse> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    })
  } catch {
    throw new Error(
      "Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando em localhost:8080."
    )
  }

  if (!res.ok) {
    const errorText = await res.text()
    let message = "Erro ao fazer login"
    try {
      const errorJson = JSON.parse(errorText)
      message = errorJson.message || errorJson.error || message
    } catch {
      if (res.status === 401 || res.status === 403) {
        message = "Email ou senha incorretos"
      }
    }
    throw new Error(message)
  }

  const data: AuthResponse = await res.json()

  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        userId: data.userId,
        nome: data.nome,
        email,
      })
    )
  }

  return data
}

export async function register(payload: RegisterPayload): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      "Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando em localhost:8080."
    )
  }

  if (!res.ok) {
    const errorText = await res.text()
    let message = "Erro ao criar conta"
    try {
      const errorJson = JSON.parse(errorText)
      message = errorJson.message || errorJson.error || message
    } catch {
      if (res.status === 409) {
        message = "Este email ja esta em uso"
      } else if (res.status >= 500) {
        message = "Erro interno do servidor. Verifique os logs do backend."
      }
    }
    throw new Error(message)
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function getUser(): UserData | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("auth_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
